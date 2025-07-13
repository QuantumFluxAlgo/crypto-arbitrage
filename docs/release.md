# Release Guide

Use these steps to package and publish a new release of the Crypto Arbitrage platform.

---

## Step 1 – Merge to `main`

1. Open a pull request for your feature branch.
2. After reviews pass, merge the pull request into the `main` branch.

---

## Step 2 – Tag the commit

1. Identify the commit you want to tag (usually the tip of `main`).
2. Create an annotated tag named `batch-10-complete`:

```bash
git tag -a batch-10-complete -m "batch-10-complete"
```

---

## Step 3 – Push the tag

Push the tag to GitHub so it is available for releases:

```bash
git push origin batch-10-complete
```

---

## Step 4 – Create the GitHub release

1. Visit your repository on GitHub and open the **Releases** tab.
2. Click **Draft new release**.
3. Select the `batch-10-complete` tag and publish the release.

---

## Step 5 – Include the changelog and verify artifacts

1. Copy the relevant entries from `CHANGELOG.md` and paste them into the release notes.
2. Upload `CHANGELOG.md` as an attachment when drafting the release.
3. Download any release artifacts and confirm they work as expected.

Follow this checklist every time you ship a new version.

