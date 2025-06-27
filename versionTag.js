#!/usr/bin/env node
import { readFileSync } from 'fs';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import path from 'path';

// 获取当前模块路径
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class VersionRelease {
  constructor() {
    this.packagePath = path.join(__dirname, 'package.json');
    this.currentVersion = null;
    this.tagName = null;
  }

  async run() {
    try {
      await this.checkTagExists();
      await this.gitOperations();
      console.log(`版本 ${this.currentVersion} 处理完成，tag ${this.tagName} 已创建并推送`);
    } catch (error) {
      console.error('脚本执行出错:', error.message);
      process.exit(1);
    }
  }

  async checkTagExists() {
    const packageJson = JSON.parse(readFileSync(this.packagePath, 'utf8'));
    this.currentVersion = packageJson.version;
    this.tagName = `v${this.currentVersion}`;

    try {
      const existingTags = execSync(`git tag -l ${this.tagName}`).toString().trim();
      if (existingTags) {
        console.log(`Tag ${this.tagName} 已存在，操作终止`);
        process.exit(0);
      }
    } catch (error) {
      throw new Error(`检查tag时出错: ${error.message}`);
    }
  }

  async gitOperations() {
    console.log(`开始处理版本 ${this.currentVersion}...`);

    // 切换到dev分支并拉取最新代码
    console.log('切换到dev分支并拉取最新代码...');
    this.executeCommand('git checkout dev');
    this.executeCommand('git pull');

    // 切换到main分支并拉取最新代码
    console.log('切换到main分支并拉取最新代码...');
    this.executeCommand('git checkout main');
    this.executeCommand('git pull');

    // 将dev分支合并到main
    console.log('将dev分支合并到main...');
    this.executeCommand('git merge dev');

    // 将dev分支合并到main
    console.log('推送main到远端...');
    this.executeCommand('git push');

    // 创建并推送tag
    console.log(`创建tag ${this.tagName}...`);
    this.executeCommand(`git tag -a ${this.tagName} -m "Version ${this.currentVersion}"`);
    console.log('推送tag到远端...');
    this.executeCommand(`git push origin ${this.tagName}`);

    // 切换回dev分支
    console.log('切换回dev分支...');
    this.executeCommand('git checkout dev');
  }

  executeCommand(command) {
    try {
      execSync(command, { stdio: 'inherit' });
    } catch (error) {
      throw new Error(`执行命令 "${command}" 失败: ${error.message}`);
    }
  }
}

// 执行脚本
new VersionRelease().run();