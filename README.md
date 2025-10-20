# Universal Ternary Gates

## Project Goal

This project aims to identify and catalog all universal, functionally complete ternary gates for two inputs. These are logic gates that can be used to construct any other logic function within a 3-value system.

## Motivation

Exploring computation in base-3 (ternary) is interesting for a few reasons:

1.  **Efficiency**: Ternary systems can be more efficient at representing information than binary (base-2).
2.  **Richer Logic**: The three states can map nicely to concepts like "yes, no, maybe" or "true, false, unknown," which has potential applications in areas like quantum computing or advanced AI.

## Logic System

The logic system used here is **Post logic**. The foundational gate used to build all other universal gates is the **TAND gate**, defined by the following truth table:

| TAND | 0 | 1 | 2 |
| :--: |:-:|:-:|:-:|
| **0**| 1 | 2 | 2 |
| **1**| 2 | 2 | 2 |
| **2**| 2 | 2 | 0 |

---

## Code Overview

This project contains two main Python scripts for generating and analyzing the gates.

### 1. Gate Generation (`generate_gates.py`)

This script systematically generates and saves all 3,774 universal ternary gates.

<details>
<summary>Pseudocode for `generate_gates.py`</summary>

```
FUNCTION generate_universal_gates(n = 3):
  // 1. Define all possible non-universal conditions (constraints)
  //    These are properties that a non-universal gate would have.
  //    - Closure: Output is always within a smaller subset of values.
  //    - Partitions: Gate preserves certain groupings of values.
  //    - Permutations: Gate follows specific permutation patterns.
  
  // 2. Iterate through every possible 2-input gate for n-valued logic.
  //    Total gates = n^(n^2) = 3^(3^2) = 19,683
  FOR each possible gate G:
    is_universal = TRUE
    
    // 3. Check G against every non-universal constraint.
    FOR each constraint C:
      IF G satisfies C:
        is_universal = FALSE
        BREAK // Move to the next gate
        
    // 4. If the gate satisfies none of the constraints, it is universal.
    IF is_universal:
      ADD G to list of universal gates
      
  // 5. Save all found universal gates to JSON files.
  SAVE each universal gate to a file in the `gates/` directory.
  
// Run the generation process for ternary logic (n=3).
generate_universal_gates(3)

```
</details>

### 2. TAND Representation Finder (`find_tand_representations.py`)

This script takes the generated gates and tries to find the simplest way to build each one using only the TAND gate.

<details>
<summary>Pseudocode for `find_tand_representations.py`</summary>

```
FUNCTION find_tand_representations():
  // 1. Load all 3,774 universal gates from their JSON files.
  LOAD all gates from `gates/` directory.

  // 2. Initialize a set of known expressions with basic building blocks.
  known_expressions = {"x", "y", "0", "1", "2"}
  
  // 3. Iteratively build more complex expressions.
  FOR depth = 1 to max_depth:
    // Create new expressions by combining all known expressions
    // with each other using the TAND gate.
    // e.g., TAND(x, y), TAND(x, 0), TAND(x, TAND(y, 1)), etc.
    
    new_expressions = apply_tand_to_all_pairs(known_expressions)
    
    // 4. For each new expression, calculate its truth table.
    FOR each new_expr in new_expressions:
      table = calculate_truth_table(new_expr)
      
      // If this table matches one of the universal gates, we found a representation.
      IF table matches a universal_gate AND gate has no representation yet:
        SAVE new_expr as the TAND representation for that gate.
        
      // Add the new, unique expression to our set of known expressions.
      ADD new_expr to known_expressions
      
  // 5. Update the JSON files with the found TAND representations.
  UPDATE gate JSON files with the simplest TAND string found.

// Run the search process.
find_tand_representations()
```
</details>

---

## Requirements

- Python 3.x
- Node.js (for the web interface)
- `npm` or `yarn`

## How to Run Locally

1.  **Clone the repository:**
    ```bash
    git clone <repository_url>
    cd <repository_directory>
    ```

2.  **Generate the Gates:**
    First, run the script to generate all the universal gate definition files.
    ```bash
    python generate_gates.py
    ```
    This will create a `gates/` directory filled with JSON files.

3.  **Find TAND Representations:**
    Next, run the script to find how to build each gate from the TAND gate. This is computationally intensive and will use all available CPU cores.
    ```bash
    python find_tand_representations.py
    ```
    This will update the files in `gates/` with their TAND representations.

4.  **Run the Web Interface:**
    Install dependencies and start the Next.js development server.
    ```bash
    npm install
    npm run dev
    ```

    Open your browser to `http://localhost:3000` to see the interactive documentation.
