# Get Started

## Install `fnm`, a tool for Node.js environment

- If you want full and detailed instructions, head to [fnm homepage](https://github.com/Schniz/fnm#Installation)

### For Windows user

#### install using `winget`

```powershell
winget install Schniz.fnm
```

#### configuring your shell

##### Powershell users

Add the following to the end of your profile file:

```powershell
fnm env --use-on-cd | Out-String | Invoke-Expression
```

- For macOS/Linux, the profile is located at `~/.config/powershell/Microsoft.PowerShell_profile.ps1`
- On Windows, PowerShell comes pre-installed, but there are two versions of it. Read more about it here. The profile is located at different places depending on which version you're using:
  - Built in PowerShell (aka "Windows PowerShell"): `~\Documents\WindowsPowerShell\Microsoft.PowerShell_profile.ps1`
  - The newer, PowerShell >= 7, that's not built in: `~\Documents\PowerShell\Microsoft.PowerShell_profile.ps1`

##### Bash users

Add the following to your `.bashrc` file.

```bash
eval "$(fnm env --use-on-cd)"
```

### For macOS/Linux user

```sh
curl -fsSL https://fnm.vercel.app/install | bash
```

#### configuring your shell

> If you do not what shell is running, type `echo $SHELL` to check.

##### Zsh users (macOS default)

Add the following to your `.zshrc` file.

```sh
eval "$(fnm env --use-on-cd)"
```

##### Bash users

Add the following to your `.bashrc` file.

```bash
eval "$(fnm env --use-on-cd)"
```

## Clone code

### Fork the main branch into your own account.

Do it on the GitHub website.

### Git Clone

```sh
git clone git@github.com/<your_user_name>/PineappleStudio.git # This link is only for example, it may be different depending on how you name your own repo.

cd PineappleStudios
```

### Install Node.js

> Warn: make sure you are in side the `PineappleStudio` project directory.

When you `cd` into the folder, `fnm` will ask you if you want to install node, answer `y` to install.

Under the project folder, run the following:

```sh
fnm install
```

Check your node version:

```sh
node --version
```

It should be `20.11.0`.

Additionally, you may set the version as default using the following commands:

```sh
fnm default 20.11.0
```

### Install PNPM

> On Windows Powershell, there maybe some errors with pnpm, then you just use npm as well. So you do not need to do the following process.

Make sure you are running `node@20.11.0`, and run the following.

```sh
corepack enable
corepack prepare pnpm@8.15.1 --activate
```

### Install Dependencies

Under the project folder, run the following:

```sh
pnpm install
```

## Start coding (Web Platform)

### For debugging

Under the project folder, run the following:

```sh
pnpm dev
```

### For production

Under the project folder, run the following:

```sh
pnpm build
```

## Remember to use Pull Request

## What if you want to update dependencies/add additional dependencies?

We may discuss it on Telegram.
