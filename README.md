# Moodle Availability Helper

The repository contains the installable `local_availabilityhelper` Moodle plugin.
It adds deterministic, live feedback to Moodle's existing availability editor.
It does not use AI, store user data, or modify the saved availability JSON.

## Compatibility

- Moodle 4.5 LTS through Moodle 5.2
- PHP versions supported by the corresponding Moodle release

## Current checks

- identical sibling rules or rule groups
- empty nested groups
- unnecessary non-negated single-child group nesting
- a predicate and its logical opposite in the same AND/OR group
- propagation of definite `always` / `never` results through nested groups
- incomplete Core/editor validation state
- safe semantic implications for Core profile-field conditions
- broad/specific redundancy for the common `availability_cohort` condition

## Architecture

- `amd/src/adapter/yui.js`: isolated private editor integration
- `amd/src/analyzer.js`: deterministic tree analysis
- `amd/src/relations.js`: optional semantic relation registry
- `amd/src/ui.js`: live feedback and detailed report
- `amd/src/bootstrap.js`: orchestration and debouncing

Install the repository contents as `local/availabilityhelper` in Moodle.
