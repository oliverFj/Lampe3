// gyroscope.js

/**
 * Gyroscope utility class for handling and normalizing gyroscope data.
 * Provides methods to process, filter, and analyze gyroscope inputs for various applications.
 */
export default class Gyroscope {
    /**
     * Normalizes gyroscope data based on type.
     * @param {string} type - The type of gyroscope data ('beta', 'gamma', 'alpha').
     * @param {number} value - The raw sensor value.
     * @returns {number} Normalized value between 0 and 1.
     */
    static normalizeData(type, value) {
        switch (type) {
            case 'beta':
            case 'gamma':
                let capped = Math.min(Math.max(value, -90), 90);
                return (capped + 90) / 180;
            case 'alpha':
                return value / 360;
            default:
                console.error("Invalid type for normalization");
                return 0;  // Return 0 for unknown types as a fallback.
        }
    }

    /**
     * Calculates weight based on the normalized beta value.
     * @param {number} beta - The beta value from gyroscope data.
     * @returns {number} Weight based on beta, normalized between 0 and 1.
     */
    static calculateWeight(beta) {
        let cappedBeta = Math.min(Math.max(beta, -90), 90);
        let normalizedBeta = this.normalizeData('beta', beta);
        console.log(`Calculated weight for beta ${beta}: ${normalizedBeta}`);
        return normalizedBeta;
    }

    /**
     * Calculates vectors for gyroscope data including beta, gamma, and alpha.
     * @param {number} beta 
     * @param {number} gamma 
     * @param {number} alpha 
     * @returns {object} Object containing normalized vectors for beta, gamma, and alpha.
     */
    static calculateVector(beta, gamma, alpha) {
        const betaNorm = this.normalizeData('beta', beta);
        const gammaNorm = this.normalizeData('gamma', gamma);
        const alphaNorm = this.normalizeData('alpha', alpha);
        return { beta: betaNorm, gamma: gammaNorm, alpha: alphaNorm };
    }

    /**
     * Applies dynamic thresholding to determine if a value exceeds a dynamic threshold.
     * @param {number} value - The value to be tested.
     * @param {number} threshold - Base threshold for detection.
     * @param {number} sensitivity - Multiplier to adjust the threshold dynamically.
     * @returns {boolean} True if value exceeds the dynamically adjusted threshold, otherwise false.
     */
    static applyDynamicThresholding(value, threshold, sensitivity) {
        const dynamicThreshold = threshold * sensitivity;
        return Math.abs(value) > dynamicThreshold;
    }

    /**
     * Filters gyroscope data using a low-pass filter.
     * @param {number} value - The value to be filtered.
     * @param {string} filterType - Type of filter to apply ('low-pass' supported).
     * @param {number} factor - Smoothing factor, lower values mean more smoothing.
     * @returns {number} Smoothed value.
     */
    static filterData(value, filterType = 'low-pass', factor = 0.1) {
        if (filterType === 'low-pass') {
            this.prevValue = this.prevValue || value; // Initialize if not already done
            const filteredValue = this.prevValue * (1 - factor) + value * factor;
            this.prevValue = filteredValue;
            return filteredValue;
        }
        throw new Error(`Unsupported filter type: ${filterType}`);
    }

    /**
     * Detects a specific motion pattern in an array of gyroscope data.
     * @param {array} dataArray - Array of gyroscope data values.
     * @param {any} pattern - The pattern to be detected.
     * @returns {boolean} True if the pattern is detected, otherwise false.
     */
    static detectMotionPattern(dataArray, pattern) {
        // Simple heuristic to match a pattern in gyroscope data
        // Implementation to be defined based on specific pattern requirements
        return dataArray.some(data => data === pattern);
    }

    /**
     * Corrects orientation data based on a reference orientation to handle device tilts.
     * @param {object} data - Current orientation data.
     * @param {object} referenceOrientation - Reference orientation for correction.
     * @returns {object} Corrected orientation data.
     */
    static correctOrientation(data, referenceOrientation) {
        // Corrects data based on a reference orientation
        // Placeholder for demonstration; implementation details would depend on specific needs
        return {
            beta: data.beta - referenceOrientation.beta,
            gamma: data.gamma - referenceOrientation.gamma,
            alpha: data.alpha - referenceOrientation.alpha
        };
    }
}
