# IdeaBridge Git Workflow & Integration Protocol

> [!WARNING]
> **Token Security Alert:** A Personal Access Token (PAT) (`github_pat_11BGJU...`) was shared openly in the request prompt. **Please revoke this token from your GitHub Developer Settings immediately** as anyone with access to that string can modify your repositories. Generate a fresh PAT for the terminal prompted authentications.

## Step 1: Repository Architecture & Branch Initialization

This sets up the initial `main`, `dev`, and the four mapped feature branches constraint. Make sure you run this from within your `C:\Users\akshayan\Documents\sliit\itpm\final project` directory.

```bash
# 1. Initialize the git repository locally
git init

# 2. Add your GitHub remote repository (Create an empty repo on GitHub first if you haven't)
# Replace <YOUR_GITHUB_REPO_URL> with the actual repository URL
git remote add origin <YOUR_GITHUB_REPO_URL>

# 3. Create the initial commit so the 'main' branch exists
echo "# IdeaBridge" > README.md
git add README.md
git commit -m "Initial commit: Set up repository"
git branch -M main

# 4. Push main branch first (When prompted in terminal, use username: AK29-Shay and your fresh PAT)
git push -u origin main

# 5. Create the central integration branch (dev) and push to remote
git checkout -b dev
git push -u origin dev

# 6. Create feature branches from dev and push to the remote for all members
git checkout -b feat/member1-sneha-dhaya-IT dev
git push -u origin feat/member1-sneha-dhaya-IT

git checkout -b feat/member2-AK29-Shay dev
git push -u origin feat/member2-AK29-Shay

git checkout -b feat/member3-NethminiChinthana101 dev
git push -u origin feat/member3-NethminiChinthana101

git checkout -b feat/member4-abinayan03 dev
git push -u origin feat/member4-abinayan03

# 7. Check out your own branch to get to work
git checkout feat/member2-AK29-Shay
```

---

## Step 2: The Daily Sync & Push Protocol (Your Personal Flow)

Run these exact commands day-to-day on your machine to ensure your feature branch (Idea Posting & Recursive Comments) stays perfectly in sync with changes your team drops into `dev` (like updated auth states or DB schemas).

```bash
# 1. Ensure you are currently sitting on your feature branch
git checkout feat/member2-AK29-Shay

# 2. Stash any uncommitted work (creates a temporary save state)
git stash

# 3. Fetch all new remote history without merging yet
git fetch origin

# 4. Step over to local 'dev' and pull its newest state from the remote
git checkout dev
git pull origin dev

# 5. Switch back to your feature branch
git checkout feat/member2-AK29-Shay

# 6. Merge the team's latest dev progress into your branch to stay completely up to date
git merge dev
# (If there are conflicts, fix them in VS Code, git add the files, and commit)

# 7. Pop your stash to re-apply the uncommitted work you temporarily saved
git stash pop
# (If your stashed changes clash with the new dev changes, resolve in VS Code)

# 8. Stage, Commit, and Push your daily updates back up to GitHub
git add .
git commit -m "feat/member2: daily update for Idea Posting and Comments"
git push origin feat/member2-AK29-Shay
```

---

## Step 3: The Progress 2 Integration Workflow (Integration Lead)

As the integration lead, use this protocol to safely merge everything into `dev` before the major Progress 2 demonstration.

```bash
# 1. Make sure your local git index is totally aware of the latest remote changes
git fetch --all

# 2. Checkout your central dev branch and update it
git checkout dev
git pull origin dev

# 3. Carefully merge each branch, one by one.
# Merge Member 1 (User Management & Auth)
git merge origin/feat/member1-sneha-dhaya-IT
# >> Fix conflicts (if any) -> Stage changes -> git commit

# Merge Member 3 (Search, Filters & Trending)
git merge origin/feat/member3-NethminiChinthana101
# >> Fix conflicts (if any) -> Stage changes -> git commit

# Merge Member 4 (Analytics Dashboard & Database)
git merge origin/feat/member4-abinayan03
# >> Fix conflicts (if any) -> Stage changes -> git commit

# Finally, Merge Your Own Branch (Idea Posting)
git merge feat/member2-AK29-Shay
# >> Fix conflicts (if any) -> Stage changes -> git commit

# 4. Push the fully integrated dev branch to GitHub for the actual presentation!
git push origin dev
```

### 🚨 Handling Merge Conflicts in VS Code

If you hit text like `CONFLICT (content): Merge conflict in...` while running a `git merge`, **do not panic or force push**.

1. **Locate Conflicts**: Open VS Code. In the left sidebar, click the **Source Control** (branch icon). Look under the **Merge Changes** dropdown.
2. **Next.js App Router Files**: Next.js configurations (`layout.tsx` or `page.tsx`) usually see clashes because multiple people imported different React components or wrapping Context Providers.
   - Observe the `<<<<<<< HEAD` (current branch) and `>>>>>>>` (incoming branch) sections.
   - Click **Accept Both Changes** in the inline codelens.
   - Manually restructure the imports at the top and ensure both `<AuthProvider>` and your custom `<LayoutProvider>` wrap `children` properly.
3. **Supabase Configurations (`supabase/config.toml` or schemas)**: Database schemas are extremely sensitive text nodes. If Member 1 changed users table and Member 4 changed insights, do not accidentally accept just one file over the other. Choose **Accept Both Changes**, then manually ensure the TOML/SQL definitions combine beautifully without overwriting structural fields.
4. **Finalizing**: Once resolved and the file is saved, click the **`+`** icon next to the file in the Source Control drawer to stage it, then commit it.
