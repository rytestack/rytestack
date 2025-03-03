/**
 * @fileoverview Utility functions for Rytestack
 *
 * Common utilities used across the Rytestack framework.
 */
import path from 'path';
import fs from 'fs/promises';

/**
 * Ensures that a directory exists, creating it if necessary
 *
 * @param dirPath Directory path to ensure
 */
export async function ensureDir(dirPath: string): Promise<void> {
    try {
        await fs.mkdir(dirPath, { recursive: true });
    } catch (err) {
        // Ignore if directory already exists
    }
}

/**
 * Resolves a path relative to the current working directory
 *
 * @param relativePath Path relative to CWD
 * @returns Absolute path
 */
export function resolvePath(relativePath: string): string {
    return path.resolve(process.cwd(), relativePath);
}

/**
 * Checks if a file exists
 *
 * @param filePath Path to check
 * @returns True if file exists, false otherwise
 */
export async function fileExists(filePath: string): Promise<boolean> {
    try {
        const stat = await fs.stat(filePath);
        return stat.isFile();
    } catch (err) {
        return false;
    }
}

/**
 * Checks if a directory exists
 *
 * @param dirPath Path to check
 * @returns True if directory exists, false otherwise
 */
export async function dirExists(dirPath: string): Promise<boolean> {
    try {
        const stat = await fs.stat(dirPath);
        return stat.isDirectory();
    } catch (err) {
        return false;
    }
}

/**
 * Writes JSON to a file
 *
 * @param filePath Output file path
 * @param data Data to write
 */
export async function writeJson(filePath: string, data: any): Promise<void> {
    await ensureDir(path.dirname(filePath));
    await fs.writeFile(filePath, JSON.stringify(data, null, 2));
}

/**
 * Reads JSON from a file
 *
 * @param filePath Input file path
 * @returns Parsed JSON data
 */
export async function readJson<T>(filePath: string): Promise<T> {
    const content = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(content) as T;
}