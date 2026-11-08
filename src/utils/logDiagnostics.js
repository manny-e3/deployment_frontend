/**
 * Intelligent Deployment Error Diagnostics & Root Cause Classifier
 * Analyzes raw deployment terminal output to determine if an issue
 * originated from the SERVER environment or the PROJECT codebase,
 * providing clear explanations and actionable remediation steps.
 */

export function analyzeDeploymentError(logs = [], exitCode = null) {
  if (!logs || logs.length === 0) return null

  // Join lines into full text for regex pattern matching
  const allLines = logs
    .map((l) => (typeof l === 'string' ? l : l.line || l.text || ''))
    .map((l) => l.replace(/\u001b\[[0-9;]*[a-zA-Z]/g, '').replace(/\[\d+(?:;\d+)*m/g, ''))

  const fullText = allLines.join('\n')

  // Helper to extract the most relevant line matching a pattern
  const findLine = (pattern) => {
    return allLines.find((l) => pattern.test(l)) || null
  }

  // 1. Outdated Server Node.js (styleText / Vite 6 engine mismatch)
  if (
    /does not provide an export named 'styleText'/i.test(fullText) ||
    (allLines.some((l) => /SyntaxError/i.test(l)) && allLines.some((l) => /Node\.js v18\./i.test(l)))
  ) {
    return {
      origin: 'server',
      badge: 'SERVER RUNTIME OUTDATED',
      badgeColor: 'bg-[#FAF3E7] text-[#B87E0C] border-[#F1D6A4]',
      iconType: 'server',
      title: 'Server Node.js Version Incompatible (Outdated Runtime)',
      summary:
        "Your project is built with modern Vite / Rolldown, which requires Node.js 20.12+ or Node.js 22+. The server executed this step with Node.js 18, which lacks the 'styleText' utility in 'node:util'.",
      suggestedFix:
        'Switch your server to Node.js 20 or Node.js 22. On Hostinger/cPanel, select Node 22 in hPanel, or ensure /opt/alt/alt-nodejs22/root/usr/bin is loaded in your deployment script.',
      highlightedLine: findLine(/styleText|SyntaxError/i),
    }
  }

  // 2. Missing Node.js or npm on Server
  if (
    /(npm|node|npx|yarn|pnpm): command not found/i.test(fullText) ||
    /bash: line \d+: (npm|node|npx): command not found/i.test(fullText)
  ) {
    return {
      origin: 'server',
      badge: 'SERVER ENVIRONMENT ISSUE',
      badgeColor: 'bg-[#FAEBE9] text-[#C2412D] border-[#F1B5AC]',
      iconType: 'server',
      title: 'Missing Server Runtime: Node.js / npm not found',
      summary:
        "The deployment hook attempted to execute Node.js or npm, but the binaries are not installed or not in the server's non-interactive SSH PATH.",
      suggestedFix:
        'Verify Node.js is installed on your server. If using Hostinger or cPanel, ensure CloudLinux alt-nodejs22 (/opt/alt/alt-nodejs22/root/usr/bin) is prepended to PATH.',
      highlightedLine: findLine(/(npm|node|npx): command not found/i),
    }
  }

  // 3. Missing PHP Composer on Server
  if (/composer: command not found/i.test(fullText)) {
    return {
      origin: 'server',
      badge: 'SERVER ENVIRONMENT ISSUE',
      badgeColor: 'bg-[#FAEBE9] text-[#C2412D] border-[#F1B5AC]',
      iconType: 'server',
      title: 'Missing Server Dependency: PHP Composer not found',
      summary:
        "The post-deploy hook requires PHP Composer to install dependencies, but Composer is not available in the server's execution PATH.",
      suggestedFix:
        'Install Composer globally on the server (e.g. `curl -sS https://getcomposer.org/installer | php && mv composer.phar /usr/local/bin/composer`).',
      highlightedLine: findLine(/composer: command not found/i),
    }
  }

  // 4. PHP Version / Missing PHP Extensions
  if (
    /This package requires php .* but your PHP version/i.test(fullText) ||
    /The requested PHP extension .* is missing/i.test(fullText)
  ) {
    return {
      origin: 'server',
      badge: 'SERVER RUNTIME MISMATCH',
      badgeColor: 'bg-[#FAF3E7] text-[#B87E0C] border-[#F1D6A4]',
      iconType: 'server',
      title: 'PHP Runtime or Extension Incompatibility',
      summary:
        "The server's active PHP CLI version or enabled extensions (e.g. ext-mbstring, ext-zip, ext-pdo) do not meet the project's composer.json specifications.",
      suggestedFix:
        'Enable the required PHP extensions in your hosting control panel (hPanel / cPanel) or update the server default PHP CLI version.',
      highlightedLine: findLine(/requires php|extension .* is missing/i),
    }
  }

  // 5. Disk Space Exhaustion on Server
  if (
    /No space left on device/i.test(fullText) ||
    /ENOSPC/i.test(fullText) ||
    /Disk quota exceeded/i.test(fullText)
  ) {
    return {
      origin: 'server',
      badge: 'SERVER HARDWARE LIMIT',
      badgeColor: 'bg-[#FAEBE9] text-[#C2412D] border-[#F1B5AC]',
      iconType: 'server',
      title: 'Server Disk Space or Inode Quota Exceeded',
      summary:
        'The destination server ran out of disk storage or reached its inode limit during checkout or package compilation.',
      suggestedFix:
        'Free up disk space on the server by removing old builds, stale log files, or upgrading your server hosting disk quota.',
      highlightedLine: findLine(/No space left|ENOSPC|Disk quota/i),
    }
  }

  // 6. Server File Permission Denied
  if (
    /EACCES: permission denied/i.test(fullText) ||
    /mkdir: cannot create directory.*Permission denied/i.test(fullText) ||
    /chmod: .*Operation not permitted/i.test(fullText)
  ) {
    return {
      origin: 'server',
      badge: 'SERVER PERMISSION ISSUE',
      badgeColor: 'bg-[#FAEBE9] text-[#C2412D] border-[#F1B5AC]',
      iconType: 'server',
      title: 'File Permission Denied on Server',
      summary:
        'The configured SSH user does not have write permissions to create or update files in the destination target directory.',
      suggestedFix:
        'Ensure the deployment user owns the destination web directory (e.g. `sudo chown -R $USER:$USER <target-path>` and `chmod -R 755 <target-path>`).',
      highlightedLine: findLine(/permission denied|Operation not permitted/i),
    }
  }

  // 7. Project Code / Compilation / Rollup Import Error
  if (
    /Rollup failed to resolve import/i.test(fullText) ||
    /Failed to resolve import/i.test(fullText) ||
    /error during build/i.test(fullText) ||
    /\[vite\]: Rollup failed/i.test(fullText) ||
    /Cannot find module '.*'/i.test(fullText)
  ) {
    return {
      origin: 'project',
      badge: 'PROJECT CODE ISSUE',
      badgeColor: 'bg-[#E2F0FD] text-[#005459] border-[#BEDDF7]',
      iconType: 'code',
      title: 'Project Build Failed: Code or Import Error',
      summary:
        'The project build bundler (Vite / Rollup) encountered a broken module import, syntax error, or missing file in your repository.',
      suggestedFix:
        "Check the file and path mentioned in the error below. Run `npm run build` locally in your project root to verify all imports resolve correctly before deploying.",
      highlightedLine: findLine(/Failed to resolve import|Rollup failed|error during build|Cannot find module/i),
    }
  }

  // 8. Project Dependency Conflict / ERESOLVE
  if (
    /npm ERR! code ERESOLVE/i.test(fullText) ||
    /Conflicting peer dependency/i.test(fullText)
  ) {
    return {
      origin: 'project',
      badge: 'PROJECT DEPENDENCY ISSUE',
      badgeColor: 'bg-[#E2F0FD] text-[#005459] border-[#BEDDF7]',
      iconType: 'code',
      title: 'Project Dependency Conflict (npm ERESOLVE)',
      summary:
        'npm encountered conflicting peer dependency versions specified in your package.json.',
      suggestedFix:
        "Run `npm install` locally to resolve peer conflicts, or update the post-deploy hook to run `npm install --legacy-peer-deps`.",
      highlightedLine: findLine(/code ERESOLVE|Conflicting peer dependency/i),
    }
  }

  // 9. Missing Project File: package.json
  if (/ENOENT.*open '.*package\.json'/i.test(fullText)) {
    return {
      origin: 'project',
      badge: 'PROJECT STRUCTURE ISSUE',
      badgeColor: 'bg-[#E2F0FD] text-[#005459] border-[#BEDDF7]',
      iconType: 'code',
      title: 'Missing package.json in Project Root',
      summary:
        "npm attempted to install dependencies, but no 'package.json' exists in the repository root or target directory.",
      suggestedFix:
        'Ensure package.json is committed in the root of your Git repository, or check your Target Path configuration in project settings.',
      highlightedLine: findLine(/package\.json/i),
    }
  }

  // 10. Database Connection / Migration Failure
  if (
    /SQLSTATE\[/i.test(fullText) ||
    /Access denied for user .* to database/i.test(fullText) ||
    /Connection refused.*3306/i.test(fullText)
  ) {
    return {
      origin: 'project',
      badge: 'DATABASE CONFIGURATION ISSUE',
      badgeColor: 'bg-[#FAF0E6] text-[#A0522D] border-[#F5DEB3]',
      iconType: 'database',
      title: 'Database Connection / Migration Failed',
      summary:
        'The application could not establish a connection to the database during migration or startup.',
      suggestedFix:
        'Verify your database host, port, username, password, and database name in your project Environment Variables (.env).',
      highlightedLine: findLine(/SQLSTATE|Access denied|Connection refused/i),
    }
  }

  // 11. Git Remote / Branch Not Found
  if (
    /fatal: Remote branch .* not found/i.test(fullText) ||
    /fatal: repository .* not found/i.test(fullText) ||
    /Authentication failed for/i.test(fullText)
  ) {
    return {
      origin: 'project',
      badge: 'GIT REPOSITORY ISSUE',
      badgeColor: 'bg-[#E2F0FD] text-[#005459] border-[#BEDDF7]',
      iconType: 'git',
      title: 'Git Repository or Branch Not Found',
      summary:
        'The deployment worker was unable to fetch the specified branch or access the remote repository.',
      suggestedFix:
        'Check your Project Settings to confirm that the default branch (e.g. `main` vs `master`) exists on GitHub/GitLab and repository access is granted.',
      highlightedLine: findLine(/fatal: Remote branch|fatal: repository|Authentication failed/i),
    }
  }

  // 12. Command Not Found / Exit Code 127
  if (/Script exited with code 127/i.test(fullText) || exitCode === 127) {
    return {
      origin: 'server',
      badge: 'SERVER COMMAND ISSUE',
      badgeColor: 'bg-[#FAEBE9] text-[#C2412D] border-[#F1B5AC]',
      iconType: 'server',
      title: 'Command Not Found on Server (Exit Code 127)',
      summary:
        'A command executed in your pre- or post-deploy script does not exist or is not available in PATH on the destination server.',
      suggestedFix:
        'Review the commands in your Target post-deploy script and ensure the required binaries are installed on the server.',
      highlightedLine: findLine(/command not found|code 127/i),
    }
  }

  // 13. Generic Non-Zero Failure Fallback
  if (exitCode && exitCode !== 0) {
    return {
      origin: 'unknown',
      badge: `EXIT CODE ${exitCode}`,
      badgeColor: 'bg-[#FAEBE9] text-[#C2412D] border-[#F1B5AC]',
      iconType: 'alert',
      title: 'Deployment Script Returned Error',
      summary:
        'The deployment terminated because a command in the release pipeline exited with a non-zero exit status.',
      suggestedFix:
        'Inspect the highlighted terminal log output below to review the specific command error output.',
      highlightedLine: findLine(/error|failed|fatal|exit/i),
    }
  }

  return null
}

