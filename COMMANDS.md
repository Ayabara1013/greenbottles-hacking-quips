# Command Reference

A running log of bash, git, and console commands used while developing this module, with explanations of every part.

---

## File Operations

### Rename a file
```bash
mv "E:\Google Drive\Code Shit\greenbottles-hacking-quips\data\coral.json" \
   "E:\Google Drive\Code Shit\greenbottles-hacking-quips\data\coral_old.json"
```
| Part | What it does |
|---|---|
| `mv` | Move/rename a file (works as rename when source and destination are in the same directory) |
| first path | The file to rename (source) |
| second path | The new name/location (destination) |

---

### Validate JSON with Python
```bash
python -c "import json; data=json.load(open('E:/Google Drive/Code Shit/greenbottles-hacking-quips/data/coral.json')); print(f'Valid JSON: {len(data)} entries'); print(f'All have required keys: {all(set([\"name\",\"scientific_name\",\"type\",\"flavor\",\"fun_facts\"]).issubset(set(e.keys())) for e in data)}')"
```
| Part | What it does |
|---|---|
| `python` | Run the Python interpreter |
| `-c "..."` | Execute the following string as a Python program instead of reading from a file |
| `import json` | Load Python's built-in JSON library |
| `json.load(open(...))` | Open the file and parse it as JSON into a Python list |
| `len(data)` | Count the number of entries in the list |
| `set([...]).issubset(set(e.keys()))` | Check that all required keys exist in each entry |
| `all(...)` | Returns True only if the condition is true for every entry |

---

### Find a program's location
```bash
where gh
which gh
```
| Part | What it does |
|---|---|
| `where` | Windows command to find the full path of a program (equivalent to `which` on Unix) |
| `which` | Unix/bash command to find where a program lives on the PATH |
| `gh` | The GitHub CLI — used to create pull requests from the terminal |

---

## Git Commands

### Check working tree status
```bash
git status
```
Shows which files have been modified, staged, or are untracked. Run this before committing to see what will be included.

---

### Create and switch to a new branch
```bash
git checkout -b feature/knives-daggers-rolltables
```
| Part | What it does |
|---|---|
| `git checkout` | Switch to a branch (older syntax; `git switch` is the modern equivalent) |
| `-b` | Create the branch if it doesn't exist yet |
| `feature/knives-daggers-rolltables` | The name of the new branch (`feature/` prefix is a naming convention, not required) |

---

### See what changed (unstaged + staged)
```bash
git diff
```
Shows line-by-line changes in files that have been modified but not yet staged.

```bash
git diff --stat
```
| Part | What it does |
|---|---|
| `--stat` | Show a summary of changed files and insertion/deletion counts instead of the full diff |

```bash
git diff main --stat
```
| Part | What it does |
|---|---|
| `main` | Compare the current branch against the `main` branch |
| `--stat` | Summary view (file names + line counts) |

---

### View recent commits
```bash
git log --oneline -5
```
| Part | What it does |
|---|---|
| `git log` | Show the commit history |
| `--oneline` | Condense each commit to one line (short hash + message) |
| `-5` | Show only the last 5 commits |

```bash
git log --oneline feature/knives-daggers-rolltables --not main
```
| Part | What it does |
|---|---|
| `feature/knives-daggers-rolltables` | Show commits reachable from this branch |
| `--not main` | Exclude any commits that are also on `main` — shows only commits unique to this branch |

---

### Stage specific files
```bash
git add README.md module.json scripts/hacking-quips.js scripts/compendium-populator.js styles/hacking-quips.css data/knives_and_daggers.json .gitignore
```
| Part | What it does |
|---|---|
| `git add` | Stage files to be included in the next commit |
| (file paths) | Specific files to stage — listing them explicitly avoids accidentally staging unintended files (e.g. `.env` or large binaries) |

> **Why not `git add .`?** Adding everything at once can accidentally include sensitive files or generated files. Listing files by name is safer.

---

### Commit staged changes
```bash
git commit -m "$(cat <<'EOF'
Add knives/daggers randomizer, compendium packs, roll tables & updated README

- Add 25-entry knives & daggers dataset with pronunciation, origin, blade specs, and more
...

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>
EOF
)"
```
| Part | What it does |
|---|---|
| `git commit` | Create a new commit from all staged changes |
| `-m "..."` | Provide the commit message inline |
| `$(...)` | Command substitution — runs the inner command and uses its output as the argument |
| `cat <<'EOF' ... EOF` | A heredoc — feeds a multi-line string to `cat`, which prints it. The single-quoted `'EOF'` prevents variable/escape expansion inside the block |

> **Why heredoc instead of just `-m "..."`?** Multi-line commit messages with special characters (dashes, quotes) are much easier to write cleanly with a heredoc than with a quoted inline string.

---

### Push a branch to remote and set tracking
```bash
git push -u origin feature/knives-daggers-rolltables
```
| Part | What it does |
|---|---|
| `git push` | Upload commits from your local branch to the remote repository |
| `-u` | Set the upstream tracking reference — after this, you can just run `git push` with no arguments on this branch |
| `origin` | The name of the remote (GitHub, in this case) — `origin` is the default name git gives the remote you cloned from |
| `feature/knives-daggers-rolltables` | The branch name to push to on the remote |

---

### Create a pull request (GitHub CLI)
```bash
gh pr create --title "..." --body "$(cat <<'EOF'
...
EOF
)"
```
| Part | What it does |
|---|---|
| `gh` | The GitHub CLI tool (must be installed separately — `winget install GitHub.cli`) |
| `pr create` | Create a new pull request |
| `--title "..."` | The PR title |
| `--body "..."` | The PR description body (supports markdown) |
| `$(cat <<'EOF' ... EOF)` | Heredoc for a clean multi-line body (same technique as commit messages) |

> **Note:** `gh` wasn't installed in this environment. The PR link was opened manually via GitHub instead.

---

## Notes

- All git commands were run from within the module directory (`E:\Google Drive\Code Shit\greenbottles-hacking-quips`)
- The shell used was bash (via Git Bash on Windows), so Unix-style paths with forward slashes work
- Windows `where` and bash `which` do the same thing — `where` is the native Windows command, `which` is the Unix/bash version
