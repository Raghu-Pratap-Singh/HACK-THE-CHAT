function strength_calculator(avg50, avg) {
    // calculates strength and returns link strength status
    // {1 : "weak", 2 : "moderate", 3 : "strong"}
    

   

    if (avg50>0 && avg>0) {
        // strong bond
        if (avg50 <= 0.25 * avg) {
            // fast reply time recently
            return 3;
        } else if (avg50 <= 0.75 * avg) {
            // moderate reply time recently
            return 2;
        } else {
            return 1;
            // weak bond
        }
    }

    return 1;
    // weak bond if no chat or reply exists

}

module.exports.strength_calculator = strength_calculator;