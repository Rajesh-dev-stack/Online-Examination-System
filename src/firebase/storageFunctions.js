// Storage replaced by Cloudinary

/**
 * Upload an assignment submission file to Cloudinary
 * (Bypasses Firebase Storage to fix hanging upload bugs)
 */
export const uploadSubmissionFile = async (assignmentId, studentId, file) => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'Assignments');
    formData.append('cloud_name', 'nczyrdpi');
    
    // Use /auto/upload to let Cloudinary auto-detect if it's an image, PDF, etc.
    const response = await fetch('https://api.cloudinary.com/v1_1/nczyrdpi/auto/upload', {
      method: 'POST',
      body: formData
    });

    const data = await response.json();
    
    if (data.secure_url) {
      return { url: data.secure_url, error: null };
    } else {
      return { url: null, error: data.error?.message || 'Failed to upload to Cloudinary' };
    }
  } catch (error) {
    return { url: null, error: error.message };
  }
};
