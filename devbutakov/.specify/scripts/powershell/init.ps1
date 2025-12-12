#!/usr/bin/env pwsh
# Initialize a Specify project
#
# This script sets up a new Specify project structure in the current directory.
# It creates necessary directories, initializes templates, and sets up the project.

[CmdletBinding()]
param(
    [switch]$Json,
    [switch]$Help,
    [string]$ProjectName = "devbutakov"
)

$ErrorActionPreference = 'Stop'

# Show help if requested
if ($Help) {
    Write-Output @"
Usage: ./init.ps1 [-Json] [-ProjectName <name>] [-Help]

Initialize a Specify project structure.

OPTIONS:
  -Json               Output results in JSON format
  -ProjectName <name>  Set the project name (default: devbutakov)
  -Help               Show this help message

EXAMPLES:
  # Initialize with default project name
  .\init.ps1

  # Initialize with custom project name
  .\init.ps1 -ProjectName "my-project"

  # Get JSON output
  .\init.ps1 -Json

"@
    exit 0
}

# Get script directory and repository root
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$repoRoot = (Resolve-Path (Join-Path $scriptDir "../../..")).Path

Set-Location $repoRoot

# Create necessary directories
$directories = @(
    "specs",
    ".specify/templates",
    ".specify/scripts/powershell",
    ".specify/memory",
    ".cursor/commands"
)

$createdDirs = @()
foreach ($dir in $directories) {
    $fullPath = Join-Path $repoRoot $dir
    if (-not (Test-Path $fullPath)) {
        New-Item -ItemType Directory -Path $fullPath -Force | Out-Null
        $createdDirs += $dir
        Write-Verbose "Created directory: $dir"
    } else {
        Write-Verbose "Directory already exists: $dir"
    }
}

# Check if git is initialized
$hasGit = $false
try {
    git rev-parse --show-toplevel 2>$null | Out-Null
    if ($LASTEXITCODE -eq 0) {
        $hasGit = $true
    }
} catch {
    # Git not available
}

# Check if constitution exists
$constitutionPath = Join-Path $repoRoot ".specify/memory/constitution.md"
$hasConstitution = Test-Path $constitutionPath

# Check if templates exist
$templates = @(
    "spec-template.md",
    "plan-template.md",
    "tasks-template.md",
    "checklist-template.md",
    "agent-file-template.md"
)

$existingTemplates = @()
$missingTemplates = @()

foreach ($template in $templates) {
    $templatePath = Join-Path $repoRoot ".specify/templates/$template"
    if (Test-Path $templatePath) {
        $existingTemplates += $template
    } else {
        $missingTemplates += $template
    }
}

# Check if scripts exist
$scripts = @(
    "common.ps1",
    "check-prerequisites.ps1",
    "setup-plan.ps1",
    "create-new-feature.ps1",
    "update-agent-context.ps1"
)

$existingScripts = @()
$missingScripts = @()

foreach ($script in $scripts) {
    $scriptPath = Join-Path $repoRoot ".specify/scripts/powershell/$script"
    if (Test-Path $scriptPath) {
        $existingScripts += $script
    } else {
        $missingScripts += $script
    }
}

# Check if cursor commands exist
$commands = @(
    "speckit.specify.md",
    "speckit.plan.md",
    "speckit.tasks.md",
    "speckit.implement.md",
    "speckit.clarify.md",
    "speckit.analyze.md",
    "speckit.checklist.md",
    "speckit.constitution.md",
    "speckit.taskstoissues.md"
)

$existingCommands = @()
$missingCommands = @()

foreach ($command in $commands) {
    $commandPath = Join-Path $repoRoot ".cursor/commands/$command"
    if (Test-Path $commandPath) {
        $existingCommands += $command
    } else {
        $missingCommands += $command
    }
}

# Prepare results
$result = [PSCustomObject]@{
    PROJECT_NAME = $ProjectName
    REPO_ROOT = $repoRoot
    HAS_GIT = $hasGit
    HAS_CONSTITUTION = $hasConstitution
    CREATED_DIRECTORIES = $createdDirs
    EXISTING_TEMPLATES = $existingTemplates
    MISSING_TEMPLATES = $missingTemplates
    EXISTING_SCRIPTS = $existingScripts
    MISSING_SCRIPTS = $missingScripts
    EXISTING_COMMANDS = $existingCommands
    MISSING_COMMANDS = $missingCommands
    STATUS = if ($missingTemplates.Count -eq 0 -and $missingScripts.Count -eq 0 -and $missingCommands.Count -eq 0) { "READY" } else { "INCOMPLETE" }
}

# Output results
if ($Json) {
    $result | ConvertTo-Json -Depth 10
} else {
    Write-Output "=========================================="
    Write-Output "Specify Project Initialization"
    Write-Output "=========================================="
    Write-Output ""
    Write-Output "Project Name: $ProjectName"
    Write-Output "Repository Root: $repoRoot"
    Write-Output "Git Repository: $(if ($hasGit) { 'Yes' } else { 'No' })"
    Write-Output "Constitution: $(if ($hasConstitution) { 'Found' } else { 'Missing' })"
    Write-Output ""
    
    if ($createdDirs.Count -gt 0) {
        Write-Output "Created Directories:"
        foreach ($dir in $createdDirs) {
            Write-Output "  [OK] $dir"
        }
        Write-Output ""
    }
    
    Write-Output "Templates:"
    foreach ($template in $existingTemplates) {
        Write-Output "  [OK] $template"
    }
    foreach ($template in $missingTemplates) {
        Write-Output "  [MISSING] $template"
    }
    Write-Output ""
    
    Write-Output "Scripts:"
    foreach ($script in $existingScripts) {
        Write-Output "  [OK] $script"
    }
    foreach ($script in $missingScripts) {
        Write-Output "  [MISSING] $script"
    }
    Write-Output ""
    
    Write-Output "Cursor Commands:"
    foreach ($command in $existingCommands) {
        Write-Output "  [OK] $command"
    }
    foreach ($command in $missingCommands) {
        Write-Output "  [MISSING] $command"
    }
    Write-Output ""
    
    Write-Output "Status: $($result.STATUS)"
    Write-Output ""
    
    if ($result.STATUS -eq "READY") {
        Write-Output "[SUCCESS] Project is ready to use!"
        Write-Output ""
        Write-Output "Next steps:"
        Write-Output "  1. Review and customize .specify/memory/constitution.md"
        Write-Output '  2. Create your first feature: /speckit.specify "feature description"'
    } else {
        Write-Output "[WARNING] Project initialization incomplete. Missing components listed above."
    }
}

