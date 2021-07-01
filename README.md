# algolia-backup
Super simple tool that backs up / restores Algolia indexes AND their settings

# Getting started
1. Make a copy of `.env.example` and name it `.env`
1. Replace the values there with the real ones. Alternatively, you can `export ENV_VAR=VALUE_HERE` on your shell.
1. Run `index.js` with `MODE` set to either `import` or `export` (via ENV vars)
1. ???
1. Profit! Your data is now dumped into the OUTPUT_DIR (if mode was export), or imported into your algolia indexes (if mode was import)

# Credits
Very lightly based on https://github.com/fvilers/algolia-backup