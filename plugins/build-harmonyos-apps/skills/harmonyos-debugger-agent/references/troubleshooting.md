# Build Run Troubleshooting

## Build Fails
- Read the first concrete hvigor/compiler error before changing code.
- Confirm signing, product, module, and SDK configuration.
- Re-run with the repo's documented task when `assembleHap` is not enough.

## Install Fails
- Confirm target id from `hdc list targets`.
- Confirm HAP path belongs to the build just produced.
- Check signing and package compatibility with the target OS/API.

## Launch Fails
- Infer bundle name and ability name from `app.json5` and `module.json5` when possible.
- Use `harmonyos_inspect_app_metadata` before guessing `EntryAbility`.
- Capture hilog filtered by bundle or ability after a failed launch.
