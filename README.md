# Moodle Availability Helper

Understand complex access restrictions before you save them. Availability Helper
adds live explanations to Moodle's **Restrict access** editor and helps you find
conditions that contradict each other, repeat a rule or make content always or
never available.

## Requirements and installation

- Moodle 4.5–5.2, with the PHP version required by that Moodle release.
- Install as `local/availabilityhelper`, then complete installation through
  **Site administration → Notifications**.

## Using the helper

1. Edit an activity or course section and open **Restrict access**.
2. Add or change conditions as usual. The helper displays feedback beside the rules.
3. Choose **Check rule set** for a detailed report and scenario overview.
4. Adjust your restrictions and refresh the analysis before saving.

The helper explains the rule set; it does not change your conditions automatically.
You keep control of what is saved.

## What it checks

- Duplicate rules, empty groups and unnecessary nesting.
- Contradictory conditions and groups that are always or never satisfied.
- Supported relationships between profile-field and cohort conditions.
- Incomplete conditions and content that remains visible despite restrictions.

The scenario overview shows how combinations of conditions affect access. It
evaluates rule logic rather than looking up individual users. Small rule sets show
all possible combinations; larger sets show representative cases. Other condition
types receive structural checks where their meaning cannot be established.

## Privacy

Analysis runs in the browser without an external service. The plugin stores no
personal data. Test important restrictions with users in the relevant roles as well
as reviewing the analysis.

## License

This is a 108design source-available commercial software license, not an open-source license. See [LICENSE.md](https://github.com/108design/moodle-local_availabilityhelper/blob/main/LICENSE.md) for the full terms.
