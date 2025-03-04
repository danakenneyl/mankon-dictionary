
async function updateDriveFile(fileName: string, updatedContent: string): Promise<boolean> {
    try {
      const response = await fetch('/api/update-file', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          file: fileName,
          content: updatedContent
        }),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! Status: ${response.status}`);
      }
  
      return true;
    } catch (err) {
      console.error('Error updating file:', err);
      return false;
    }
  }
  
function appendToExistingJson( existingJson: unknown[], newEntry: unknown): unknown[] {
    return [...existingJson, newEntry];
}


export async function UpdateJson(fileName: string, existingJson: unknown[], newEntry: unknown) : Promise<boolean>{
    try {
    const updatedContent = appendToExistingJson(existingJson, newEntry);

    const jsonString = JSON.stringify(updatedContent, null, 2);
    const response = await updateDriveFile(fileName, jsonString);

    if (response) {
        console.log('File successfully updated on Google Drive');
        // Navigate back to contribute page on success
      } else {
        throw new Error("Failed to update the file");
      }
      return true;
    } catch (err) {
        console.error('Error during submission:', err);
        return false;
    }
}

export async function UploadAudio(file : File): Promise<boolean> {

  try {
      const audioToSubmit = new FormData();
      audioToSubmit.append('file', file);

      const response = await fetch('/api/upload-file', {
        method: 'POST',
        body: audioToSubmit,
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Upload failed');
      }

      return true;
  } catch (err: unknown) {
    console.log('Error fetching drive files:', err);
    return false;
  }
}


export async function FetchJson(fileName: string)  {
  try {

    const response = await fetch(`/api/get-env-var-file?file=${fileName}`, {
      method: 'GET',
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    const fileData = await response.json();
    return fileData;

  } catch (err: unknown) {
    console.log('Error fetching drive files:', err);
    return undefined;
  }

}