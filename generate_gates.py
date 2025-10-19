"""
Universal Ternary Logic Gates Generator

This module computes all universal operators for n-valued logic systems.
For ternary (3-valued) logic, it finds and saves all 3,774 universal gates.

Adapted from: https://codegolf.stackexchange.com/a/267019
"""

import itertools
import json
import os
from collections import Counter


def length(x):
    """Count the number of functions in the set."""
    z = 1
    for i in x.values():
        z *= len(i)
    return z


def intersect(a, b):
    """Find the intersection of two constraint sets."""
    q = {}
    for i_key, l_val in a.items():
        d = [dict(zip(i_key, l)) for l in l_val]
        for i in i_key:
            q[i] = d
    
    for i_key, l_val in b.items():
        d = [dict(zip(i_key, l)) for l in l_val]
        seen = set()
        for i in i_key:
            d1 = q[i]
            if len(d1) == 0:
                return {tuple(q): []}
            if min(d1[0]) in seen:
                continue
            seen.update(d1[0])
            d2 = []
            for a_dict in d:
                for b_dict in d1:
                    h = a_dict.copy()
                    for j, k in b_dict.items():
                        if h.setdefault(j, k) != k:
                            break
                    else:
                        d2.append(h)
            d = d2
            if len(d) == 0:
                return {tuple(q): []}
        for i in seen:
            q[i] = d
    
    result = {}
    for i, d in q.items():
        if len(d) == 0:
            return {tuple(q): []}
        elif i == min(d[0]):
            t = tuple(sorted(d[0]))
            result[t] = [tuple(l[j] for j in t) for l in d]
    return simplify(result)


def simplify(constraint_set):
    """Simplify the constraint set representation."""
    if length(constraint_set) == 0:
        constraint_set = {(j,): [] for i in constraint_set for j in i}
    else:
        l0 = length(constraint_set)
        for i in list(constraint_set):
            l = constraint_set[i]
            d = split_up(l)
            if len(d) > 1:
                for j, o in d.items():
                    constraint_set[tuple(i[k] for k in j)] = o
                constraint_set.pop(i)
        assert l0 == length(constraint_set)
    return constraint_set


def split_up(assignments):
    """
    Simplify a list of assignments.
    
    Example: [(0,0),(0,1),(0,2),(1,0),(1,1),(1,2)] can be expressed
    as (0,1)x(0,1,2)
    """
    d = {}
    for i in range(len(assignments[0])):
        c = Counter(x[i] for x in assignments)
        if len(set(c.values())) == 1:
            q = Counter(x[:i] + x[i+1:] for x in assignments)
            if set(q.values()) == {len(c)}:
                d[i,] = [(j,) for j in c]
    
    remaining = tuple(set(range(len(assignments[0]))) - set(sum(d, ())))
    if remaining:
        d[remaining] = list({
            tuple(x[i] for i in remaining) for x in assignments
        })
    return d


def basic(values):
    """
    Return the representation for the set of functions f
    where f(i,i) = values[i].
    """
    r = range(len(values))
    a = [(i,) for i in r]
    return {
        ((x, y),): a if x != y else [(values[x],)]
        for x in r for y in r
    }


def nonempty_proper_subsets(items):
    """Generate all non-empty proper subsets of items."""
    for i in range(1, len(items)):
        yield from itertools.combinations(items, i)


def splits(items):
    """Generate all ways to split items into two groups."""
    if len(items) == 0:
        yield (), ()
        return
    x, *rest = items
    for a, b in splits(rest):
        yield (x,) + a, b
        yield a, (x,) + b


def partitions(items):
    """Generate all partitions of items."""
    if len(items) == 0:
        yield ()
        return
    x, *rest = items
    for a, b in splits(rest):
        a += (x,)
        for t in partitions(b):
            yield (a,) + t


def special_permutations(n, p):
    """Generate special permutations for given n and prime factor p."""
    for partition in partitions(list(range(n))):
        if set(map(len, partition)) == {p}:
            d = {}
            options = [
                s[i:] + s[:i] for s in partition for i in range(p)
            ]
            for s1 in partition:
                for s2_ in partition:
                    for i in range(p):
                        s2 = s2_[i:] + s2_[:i]
                        d[tuple(zip(s1, s2))] = options
            yield d


def factors(n):
    """Return the set of distinct prime factors of n."""
    p = 2
    s = set()
    while n > 1:
        if n % p == 0:
            s.add(p)
            n //= p
            while n % p == 0:
                n //= p
        p += 1 + p % 2
    return s


def canonize_(values, d, r1, r2):
    """Helper function for canonize."""
    options = []
    len0 = len(d)
    r = r1 or r2
    if len(r) == 0:
        return ()
    for i in r:
        while i not in d:
            d.append(i)
            i = values[i]
        p = (len(d) - len0, d.index(i))
        options.append(p + canonize_(
            values, d,
            [j for j in r1 if j not in d],
            [j for j in r2 if j not in d]
        ))
        while len(d) > len0:
            d.pop()
    return max(options)


def canonize(values):
    """Canonize a list of values."""
    r2 = set(values)
    r1 = set(range(len(values))) - r2
    return canonize_(values, [], r1, r2)


def union_length(constraint_list):
    """Calculate the total length of the union of constraint sets."""
    constraint_list = [s for s in constraint_list if length(s) > 0]
    if len(constraint_list) == 0:
        return 0
    x = max(constraint_list, key=length)
    l2 = []
    l1 = []
    for i in constraint_list:
        if i is not x:
            ix = intersect(i, x)
            if length(ix) < length(i):
                l1.append(i)
                l2.append(ix)
    return length(x) + union_length(l1) - union_length(l2)


def satisfies_constraint_set(func_table, constraint_set, n):
    """Check if a function table satisfies a constraint set."""
    for key, values in constraint_set.items():
        # Get the actual outputs for all pairs in this key
        actual_outputs = tuple(func_table[i][j] for i, j in key)
        
        # Check if this tuple of outputs is in the allowed values
        if actual_outputs not in values:
            return False
    return True


def magic_enumerate(n):
    """
    Enumerate all universal operators for n-valued logic.
    
    Args:
        n: The number of logic values (e.g., 3 for ternary logic)
    
    Returns:
        List of universal operators as 2D tables
    """
    if n == 1:
        return [[[0]]]
    
    values = list(range(n))
    constraint_sets = []
    
    # Build non-universal constraint sets
    for subset in nonempty_proper_subsets(values):
        allowed = [(i,) for i in subset]
        constraint_sets.append({
            ((x, y),): allowed
            for x in subset
            for y in subset
        })
    
    # Add partition-based constraints
    for partition in partitions(values):
        if len(partition) == n:
            continue
        if len(partition) == 1:
            continue
        options = {}
        d = {}
        for s1 in partition:
            for s2 in partition:
                if s1 is s2:
                    option = []
                    for s in partition:
                        if s is s1:
                            continue
                        option.extend(
                            itertools.product(s, repeat=len(s1) * len(s1))
                        )
                    d[tuple(itertools.product(s1, s1))] = option
                else:
                    ab = len(s1) * len(s2)
                    if ab not in options:
                        option = []
                        for s in partition:
                            option.extend(itertools.product(s, repeat=ab))
                        options[ab] = option
                    d[tuple(itertools.product(s1, s2))] = options[ab]
        constraint_sets.append(d)
    
    # Add special permutation constraints
    for p in factors(n):
        constraint_sets.extend(special_permutations(n, p))
    
    # Enumerate all possible operators
    universal_ops = []
    total = 0
    total_ops = n ** (n * n)
    
    print(f"Total operators to check: {total_ops}")
    
    for func_values in itertools.product(range(n), repeat=n * n):
        # Convert to table format
        func_table = [
            [func_values[i * n + j] for j in range(n)]
            for i in range(n)
        ]
        
        # Check if universal (doesn't satisfy any constraint)
        is_universal = True
        for z_set in constraint_sets:
            if satisfies_constraint_set(func_table, z_set, n):
                is_universal = False
                break
        
        if is_universal:
            universal_ops.append(func_table)
        
        total += 1
        if total % 1000 == 0:
            print(
                f"Checked {total}/{total_ops}, "
                f"found {len(universal_ops)} universal ops so far..."
            )
    
    return universal_ops


def main():
    """Generate and save all universal ternary logic gates."""
    print("Computing universal ternary logic gates...")
    n = 3
    
    # Create gates directory
    os.makedirs('gates', exist_ok=True)
    
    operators = magic_enumerate(n)
    print(f"Found {len(operators)} universal operators")
    print("Saving individual gate files...")
    
    # Convert to more readable format and save individual files
    output = {
        "n": n,
        "count": len(operators),
        "operators": []
    }
    
    for gate_id, op in enumerate(operators):
        # op is already a 2D table
        # Flatten it for the flat representation
        flat = [op[i][j] for i in range(n) for j in range(n)]
        
        gate_data = {
            "table": op,
            "flat": flat
        }
        
        output["operators"].append(gate_data)
        
        # Save individual gate file
        individual_gate = {
            "n": n,
            "gate_id": gate_id,
            "table": op,
            "flat": flat
        }
        
        filename = f'gates/gate_{gate_id:04d}.json'
        with open(filename, 'w') as f:
            json.dump(individual_gate, indent=2, fp=f)
        
        if (gate_id + 1) % 500 == 0:
            print(f"  Saved {gate_id + 1}/{len(operators)} gate files...")
    
    print(
        f"All {len(operators)} individual gate files "
        f"saved to 'gates/' folder"
    )
    
    # Save combined JSON
    with open('universal_ternary_gates.json', 'w') as f:
        json.dump(output, f, indent=2)
    
    print("Saved combined file to universal_ternary_gates.json")
    print("\nFirst operator as example:")
    print("   0 1 2")
    for i in range(n):
        print(f"{i}: {output['operators'][0]['table'][i]}")


if __name__ == '__main__':
    main()
