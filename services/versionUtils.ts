/**
 * Utility functions for version comparison
 */

/**
 * Compare two semantic version strings
 * @param version1 First version string (e.g., "4.6.0")
 * @param version2 Second version string (e.g., "4.5.0")
 * @returns 1 if version1 > version2, -1 if version1 < version2, 0 if equal
 * 
 * Note: This function only handles basic semantic versions (major.minor.patch).
 * Pre-release versions (e.g., "4.6.0-beta.1") and build metadata are not supported.
 */
export function compareVersions(version1: string, version2: string): number {
    // Extract only the numeric parts (major.minor.patch)
    const extractNumericVersion = (version: string): number[] => {
        // Remove any pre-release or build metadata
        const numericPart = version.split('-')[0].split('+')[0];
        return numericPart.split('.').map(Number);
    };

    const v1Parts = extractNumericVersion(version1);
    const v2Parts = extractNumericVersion(version2);
    
    for (let i = 0; i < Math.max(v1Parts.length, v2Parts.length); i++) {
        const v1 = v1Parts[i] || 0;
        const v2 = v2Parts[i] || 0;
        
        // Check for invalid numbers
        if (isNaN(v1) || isNaN(v2)) {
            console.warn(`Invalid version format: ${version1} or ${version2}`);
            return 0;
        }
        
        if (v1 > v2) return 1;
        if (v1 < v2) return -1;
    }
    
    return 0;
}

/**
 * Check if a version is at least the specified minimum version
 * @param version Version to check
 * @param minVersion Minimum required version
 * @returns true if version >= minVersion, false otherwise
 */
export function isVersionAtLeast(version: string | null, minVersion: string): boolean {
    if (!version) return false;
    return compareVersions(version, minVersion) >= 0;
}
