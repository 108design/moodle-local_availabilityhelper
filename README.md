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
- complete abstract scenario tables for up to four distinct predicates
- representative boundary scenarios for larger rule trees
- omission of scenarios that violate known semantic relationships
- clearly separated maintenance and testing tips

## Architecture

- `amd/src/adapter/yui.js`: isolated private editor integration
- `amd/src/analyzer.js`: deterministic tree analysis
- `amd/src/relations.js`: optional semantic relation registry
- `amd/src/scenarios.js`: truth-table and boundary-case generation
- `amd/src/ui.js`: live feedback and detailed report
- `amd/src/bootstrap.js`: orchestration and debouncing

Install the repository contents as `local/availabilityhelper` in Moodle.

## License

108design Availability Helper Software License. This is a source-available commercial
software license, not an open-source license. See [LICENSE.md](LICENSE.md) for
the full terms.
