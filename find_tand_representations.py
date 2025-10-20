import json
import multiprocessing
import os
from functools import partial
from typing import Dict, List, Tuple, Union


TAND_TABLE = [[1, 2, 2], [2, 2, 2], [2, 2, 0]]
NUM_GATES = 3774
BASE_EXPRESSIONS = ["x", "y", "0", "1", "2"]


def evaluate_tand(a: int, b: int) -> int:
    """Evaluates TAND(a, b) using the TAND truth table."""
    return TAND_TABLE[a][b]


def evaluate_expression(expr: Union[str, Dict], x: int, y: int) -> int:
    """
    Recursively evaluates an expression tree for a given set of inputs.

    Args:
        expr: The expression tree, e.g., {"op": "TAND", "left": "x", "right": "0"}.
        x: The value of the 'x' input (0, 1, or 2).
        y: The value of the 'y' input (0, 1, or 2).

    Returns:
        The resulting value (0, 1, or 2).
    """
    if isinstance(expr, str):
        if expr == "x":
            return x
        if expr == "y":
            return y
        return int(expr)
    else:
        left_val = evaluate_expression(expr["left"], x, y)
        right_val = evaluate_expression(expr["right"], x, y)
        return evaluate_tand(left_val, right_val)


def expr_to_flat_table(expr: Union[str, Dict]) -> List[int]:
    """
    Converts an expression tree into its 9-element flat truth table.

    Returns:
        A list representing the truth table, e.g., [1, 2, 2, 2, 2, 2, 2, 2, 0].
    """
    return [
        evaluate_expression(expr, x, y) for x in range(3) for y in range(3)
    ]


def expr_to_string(expr: Union[str, Dict]) -> str:
    """Converts an expression tree to a human-readable string."""
    if isinstance(expr, str):
        return expr
    else:
        left_str = expr_to_string(expr["left"])
        right_str = expr_to_string(expr["right"])
        return f"TAND({left_str}, {right_str})"


def count_tand_operations(expr: Union[str, Dict]) -> int:
    """Recursively counts the number of TAND operations in an expression."""
    if isinstance(expr, str):
        return 0
    else:
        return 1 + count_tand_operations(
            expr["left"]) + count_tand_operations(expr["right"])


def _process_chunk(
    left_expr_chunk: List, all_exprs: List, seen_tables_keys: set
) -> List[Tuple]:
    """
    Worker function for multiprocessing.

    Generates all new, unique truth tables from a given chunk of expressions.

    Args:
        left_expr_chunk: A subset of expressions to use as the "left" operand.
        all_exprs: The full list of all known expressions to use as the "right" operand.
        seen_tables_keys: A set of all previously seen truth tables to avoid duplicates.

    Returns:
        A list of tuples, where each is (flat_tuple, new_expr).
    """
    results = []
    local_seen = set()

    for left_expr in left_expr_chunk:
        for right_expr in all_exprs:
            new_expr = {"op": "TAND", "left": left_expr, "right": right_expr}
            flat_table = expr_to_flat_table(new_expr)
            flat_tuple = tuple(flat_table)

            if flat_tuple not in seen_tables_keys and flat_tuple not in local_seen:
                local_seen.add(flat_tuple)
                results.append((flat_tuple, new_expr))
    return results


def _run_parallel_search(
    all_exprs: List, seen_tables: Dict, cpu_count: int
) -> List[Tuple]:
    """
    Manages the parallel execution for a single depth level.

    Splits the work, runs it on a pool of workers, and gathers results.
    """
    chunk_size = max(1, (len(all_exprs) + cpu_count - 1) // cpu_count)
    chunks = [
        all_exprs[i:i + chunk_size] for i in range(0, len(all_exprs), chunk_size)
    ]
    seen_keys = set(seen_tables.keys())

    worker_func = partial(
        _process_chunk, all_exprs=all_exprs, seen_tables_keys=seen_keys
    )
    print(
        f"Distributing {len(all_exprs)**2:,} combinations across {cpu_count} workers..."
    )

    with multiprocessing.Pool(processes=cpu_count) as pool:
        results_from_workers = pool.map(worker_func, chunks)

    return [item for sublist in results_from_workers for item in sublist]


def _load_gates() -> Dict[int, Dict]:
    """Loads all gate JSON files from the 'gates' directory."""
    print("Loading all gate files...")
    gates = {}
    for i in range(NUM_GATES):
        filename = f"gates/gate_{i:04d}.json"
        try:
            with open(filename, "r") as f:
                gate_data = json.load(f)
                gates[i] = {
                    "flat": gate_data["flat"],
                    "gate_id": i,
                    "found": False,
                }
        except FileNotFoundError:
            print(f"Warning: Gate file not found: {filename}")
            continue
    print(f"Loaded {len(gates)} gates.")
    return gates


def _process_base_expressions(
    gates: Dict[int, Dict], seen_tables: Dict, base_exprs: List[str]
) -> int:
    """Processes depth 0 expressions and updates any matching gates."""
    print("\nProcessing base expressions (depth 0)...")
    found_count = 0
    for expr in base_exprs:
        flat_tuple = tuple(expr_to_flat_table(expr))
        if flat_tuple not in seen_tables:
            seen_tables[flat_tuple] = expr
            for gate_info in gates.values():
                if not gate_info["found"] and gate_info["flat"] == list(flat_tuple):
                    gate_info.update(
                        {
                            "found": True,
                            "tand_representation": expr,
                            "tand_string": expr,
                            "tand_operations": 0,
                        }
                    )
                    found_count += 1
    print(f"Depth 0 complete: Found {found_count}/{len(gates)} gates.")
    return found_count


def find_tand_representations(max_depth: int = 10):
    """
    Finds TAND representations for all gates using a parallel search.
    """
    gates = _load_gates()
    if not gates:
        return {}

    seen_tables = {}
    all_exprs = list(BASE_EXPRESSIONS)
    found_count = _process_base_expressions(gates, seen_tables, all_exprs)

    cpu_count = multiprocessing.cpu_count()
    print(f"\nUsing {cpu_count} CPU cores for parallel search.")

    for depth in range(1, max_depth + 1):
        if found_count >= len(gates):
            print("\nAll gates found. Stopping search.")
            break

        print(f"\n--- Starting Depth {depth} ---")
        print(f"Building from {len(all_exprs):,} unique expressions...")

        newly_found_results = _run_parallel_search(all_exprs, seen_tables, cpu_count)

        new_expressions_this_depth = 0
        newly_found_this_depth = 0
        unfound_gates = {
            gid: g for gid, g in gates.items() if not g["found"]
        }

        for flat_tuple, new_expr in newly_found_results:
            if flat_tuple not in seen_tables:
                new_expressions_this_depth += 1
                seen_tables[flat_tuple] = new_expr
                all_exprs.append(new_expr)

                for gate_info in unfound_gates.values():
                    if gate_info["flat"] == list(flat_tuple):
                        gate_info.update(
                            {
                                "found": True,
                                "tand_representation": new_expr,
                                "tand_string": expr_to_string(new_expr),
                                "tand_operations": count_tand_operations(new_expr),
                            }
                        )
                        found_count += 1
                        newly_found_this_depth += 1

        print(f"Depth {depth} complete.")
        if newly_found_this_depth > 0:
            print(f"  > Found {newly_found_this_depth} new gates this depth.")
        print(f"  > Total found: {found_count}/{len(gates)}")
        print(f"  > New unique expressions discovered: {new_expressions_this_depth}")
        print(f"  > Total unique expressions known: {len(all_exprs):,}")

        if not newly_found_results:
            print("\nNo new expressions generated. Search complete.")
            break

    print(f"\nSearch finished!")
    return gates


def update_gate_files(gates: Dict):
    """Updates all gate JSON files with their TAND representations."""
    print("\nUpdating gate files with TAND representations...")
    updated_count = 0
    not_found_count = 0

    for gate_id, gate_info in gates.items():
        filename = f"gates/gate_{gate_id:04d}.json"
        try:
            with open(filename, "r") as f:
                gate_data = json.load(f)

            if gate_info.get("found"):
                gate_data["tand_representation"] = gate_info["tand_representation"]
                gate_data["tand_string"] = gate_info["tand_string"]
                gate_data["tand_operations"] = gate_info["tand_operations"]
                updated_count += 1
            else:
                gate_data["tand_representation"] = None
                gate_data["tand_string"] = "Not found within search depth"
                gate_data["tand_operations"] = None
                not_found_count += 1

            with open(filename, "w") as f:
                json.dump(gate_data, f, indent=2)

            if (gate_id + 1) % 500 == 0:
                print(f"  Updated {gate_id + 1}/{len(gates)} files...")

        except FileNotFoundError:
            print(f"Warning: Could not update non-existent file: {filename}")
            continue

    print(f"\nUpdate complete!")
    print(f"  > Gates with TAND representations: {updated_count}")
    print(f"  > Gates not found: {not_found_count}")


def print_statistics(gates: Dict):
    """Prints summary statistics about the TAND representations found."""
    print("\n" + "=" * 60)
    print("TAND REPRESENTATION STATISTICS")
    print("=" * 60)

    op_counts = {}
    for gate_info in gates.values():
        if gate_info.get("found"):
            ops = gate_info["tand_operations"]
            op_counts[ops] = op_counts.get(ops, 0) + 1

    if not op_counts:
        print("No gate representations were found.")
        return

    print("\nGates by number of TAND operations:")
    for ops in sorted(op_counts.keys()):
        print(f"  {ops} operations: {op_counts[ops]} gates")

    print("\nExample representations (first 10 found):")
    examples_shown = 0
    for gate_id in sorted(gates.keys()):
        gate_info = gates.get(gate_id, {})
        if gate_info.get("found") and examples_shown < 10:
            print(f"  Gate {gate_id:04d}: {gate_info['tand_string']}")
            examples_shown += 1

    if gates.get(1886, {}).get("found"):
        print(f"\nTAND gate (1886) representation:")
        print(f"  {gates[1886]['tand_string']}")


def main():
    """Main function to run the entire discovery and update process."""
    print("=" * 60)
    print("TAND REPRESENTATION FINDER")
    print("=" * 60)
    print("\nThis script finds how to construct each universal ternary gate")
    print("using only the TAND gate through composition.\n")

    if not os.path.exists("gates"):
        print("Error: 'gates' directory not found.")
        print("Please run generate_gates.py first.")
        return

    found_gates = find_tand_representations(max_depth=8)

    if found_gates:
        update_gate_files(found_gates)
        print_statistics(found_gates)

    print("\n" + "=" * 60)
    print("DONE!")
    print("=" * 60)


if __name__ == "__main__":
    # Required for multiprocessing compatibility on Windows/macOS.
    multiprocessing.freeze_support()
    main()

