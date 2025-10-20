# TAND Gate Representation Guide

This guide explains how to use the scripts to generate ternary gates and find their TAND representations.

## Overview

The project now includes:
1. **`generate_gates.py`** - Generates all 3,774 universal ternary logic gates
2. **`find_tand_representations.py`** - Finds how to construct each gate using only the TAND gate

## The TAND Gate

The TAND gate (gate_1886) is a universal gate for ternary logic with the following truth table:

```
     x=0  x=1  x=2
y=0:  1    2    2
y=1:  2    2    2
y=2:  2    2    0
```

Flat representation: `[1, 2, 2, 2, 2, 2, 2, 2, 0]`

## Step 1: Generate All Gates

First, generate all universal ternary gates (if not already done):

```bash
python generate_gates.py
```

This will:
- Find all 3,774 universal operators for ternary logic
- Save each gate as `gates/gate_XXXX.json`
- Each gate now includes a `"name": ""` field that can be filled manually

### Gate JSON Format

Each gate file contains:
```json
{
  "n": 3,
  "gate_id": 1886,
  "name": "",
  "table": [
    [1, 2, 2],
    [2, 2, 2],
    [2, 2, 0]
  ],
  "flat": [1, 2, 2, 2, 2, 2, 2, 2, 0]
}
```

## Step 2: Find TAND Representations

Run the TAND representation finder:

```bash
python find_tand_representations.py
```

This script will:
1. Load all 3,774 gate files
2. Use iterative deepening to build expressions from the TAND gate
3. Find the shortest TAND representation for each gate
4. Update all gate JSON files with three new fields:
   - `tand_representation` - Tree structure of the expression
   - `tand_string` - Human-readable string representation
   - `tand_operations` - Number of TAND operations needed

### How It Works

The algorithm uses **iterative deepening**:

1. **Depth 0**: Start with base expressions: `x`, `y`, `0`, `1`, `2`
2. **Depth 1**: Generate all `TAND(a, b)` where `a, b` are from depth 0
3. **Depth 2**: Generate all `TAND(a, b)` where `a, b` are from depths 0-1
4. Continue until all gates are found or max depth is reached

This ensures we find the **shortest** representation (fewest TAND operations) for each gate.

### TAND Representation Format

The `tand_representation` field uses a tree structure:

**Simple example** (a constant):
```json
"tand_representation": "2"
```

**Complex example** (nested TANDs):
```json
"tand_representation": {
  "op": "TAND",
  "left": {
    "op": "TAND",
    "left": "x",
    "right": "y"
  },
  "right": "2"
}
```

This corresponds to the string: `"TAND(TAND(x, y), 2)"`

### Updated Gate JSON Format

After running `find_tand_representations.py`, each gate will have:

```json
{
  "n": 3,
  "gate_id": 42,
  "name": "",
  "table": [[...], [...], [...]],
  "flat": [...],
  "tand_representation": {
    "op": "TAND",
    "left": "x",
    "right": "y"
  },
  "tand_string": "TAND(x, y)",
  "tand_operations": 1
}
```

## Performance Notes

- The search space grows exponentially with depth
- At depth `d`, we explore roughly `O(n^(2^d))` combinations
- The algorithm skips duplicate truth tables to improve efficiency
- Expected runtime: 10-60 minutes depending on your CPU
- Maximum depth is set to 8 by default (can be increased if needed)

## Interpreting Results

The script will print statistics including:

- Number of gates found at each depth
- Total unique truth tables explored
- Example representations
- Gates that weren't found (if max depth was too low)

### Example Output

```
Depth 1 complete: Found 42/3774 gates
  New unique expressions at this depth: 18

Depth 2 complete: Found 156/3774 gates
  New unique expressions at this depth: 89

...

TAND REPRESENTATION STATISTICS
==============================

Gates by number of TAND operations:
  0 operations: 5 gates
  1 operations: 37 gates
  2 operations: 114 gates
  3 operations: 382 gates
  ...
```

## Notes

- The TAND gate (gate_1886) should be represented as `TAND(x, y)` (1 operation)
- Some gates might require many nested TAND operations
- If a gate isn't found, increase `max_depth` in `find_tand_representations.py` (line 280)
- The algorithm finds the **minimal** representation (fewest TAND operations)

## Verification

You can verify a TAND representation by:
1. Reading the gate's `tand_string` field
2. Manually computing the truth table for all 9 input combinations (x,y)
3. Comparing with the gate's `flat` or `table` field

## Future Enhancements

Possible improvements:
- Parallel processing for faster search
- Caching intermediate results to disk
- Alternative representations (e.g., using specific constants)
- Optimization to find minimal representations with constants

