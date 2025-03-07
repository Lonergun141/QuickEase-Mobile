import axios from 'axios';
import * as FileSystem from 'expo-file-system';
import { Buffer } from 'buffer';

const API_BASE_URL = 'https://as-v2.convertapi.com';

const getRandomApiKey = () => {
    const apiKeys = process.env.EXPO_PUBLIC_CONVERT_API.split(',');
    const randomIndex = Math.floor(Math.random() * apiKeys.length);
    return apiKeys[randomIndex];
};



// Utility function to determine the file format based on extension
const getFileFormat = (fileName) => {
    const extension = fileName.split('.').pop().toLowerCase();
    switch (extension) {
        case 'pdf':
            return 'pdf';
        case 'doc':
        case 'docx':
            return 'docx';
        case 'ppt':
        case 'pptx':
            return 'pptx';
        default:
            throw new Error('Unsupported file format');
    }
};

// Utility function to determine the MIME type based on file extension
const getMimeType = (fileName) => {
    const extension = fileName.split('.').pop().toLowerCase();
    const mimeTypes = {
        'pdf': 'application/pdf',
        'doc': 'application/msword',
        'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'ppt': 'application/vnd.ms-powerpoint',
        'pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'jpg': 'image/jpeg',
        'jpeg': 'image/jpeg',
        'png': 'image/png',

    };
    return mimeTypes[extension] || 'application/octet-stream'; 
};

// Function to save PDF data to the file system
const savePdfToFileSystem = async (base64Data, originalFileName, logInfo, logError) => {
    try {
        const timestamp = new Date().getTime();
        const cleanName = originalFileName.endsWith('.pdf') ? originalFileName : `${originalFileName}.pdf`;
        const pdfFileName = `${FileSystem.documentDirectory}${timestamp}_${cleanName}`;

        await FileSystem.writeAsStringAsync(pdfFileName, base64Data, {
            encoding: FileSystem.EncodingType.Base64,
        });

        logInfo(`PDF saved successfully to: ${pdfFileName}`);
        return pdfFileName;
    } catch (error) {
        logError(`Error saving PDF file: ${error.message}`);
        throw error;
    }
};

// Function to convert various file types to PDF
export const convertToPdf = async (file, logInfo, logError) => { 
    let apiSecret;
    try {
        // Get an available API key
        apiSecret = getRandomApiKey();
        const fromFormat = getFileFormat(file.name);
        const url = `${API_BASE_URL}/convert/${fromFormat}/to/pdf?Secret=${apiSecret}`;
        const formData = new FormData();

        // Determine MIME type using custom function
        const mimeType = getMimeType(file.name);
        logInfo(`MIME type for ${file.name}: ${mimeType}`);

        // Append the file to FormData with the correct structure
        formData.append('File', {
            uri: file.uri, 
            name: file.name, 
            type: mimeType,
        });

        logInfo(`Converting ${file.name} to PDF using API key ${apiSecret}...`);
        const response = await axios.post(url, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
                Accept: 'application/json',
            },
            timeout: 60000,
        });

        if (!response.data || !response.data.Files || !Array.isArray(response.data.Files)) {
            throw new Error('Invalid response structure from ConvertAPI');
        }

        const convertedFile = response.data.Files[0];
        
        // Handle both base64 data and remote URL for converted PDF
        if (convertedFile.FileData) {
            logInfo(`Base64 PDF data received for ${file.name}`);
            const localPdfUri = await savePdfToFileSystem(convertedFile.FileData, file.name, logInfo, logError);
            return { uri: `file://${localPdfUri}`, isLocal: true };
        } else if (convertedFile.Url) {
            logInfo(`PDF URL received for ${file.name}: ${convertedFile.Url}`);
            // Returning as a remote file URI to be used in text extraction
            return { uri: convertedFile.Url, isLocal: false };
        } else {
            throw new Error('Neither URL nor FileData found in conversion response');
        }
    } catch (error) {
        logError(
            `ConvertAPI Error for ${file.name}: ${
                error.response ? JSON.stringify(error.response.data) : error.message
            }`
        );
        throw error;
    } finally {
        console.log('goods');
    }
};

// Function to extract text from a PDF
export const extractTextFromPdf = async (pdfInfo, logInfo, logError, retries = 3) => { 
    let apiSecret;
    try {
        // Get an available API key
        apiSecret = getRandomApiKey();
        const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

        for (let attempt = 0; attempt < retries; attempt++) {
            try {
                const url = `${API_BASE_URL}/convert/pdf/to/txt?Secret=${apiSecret}`;
                const formData = new FormData();

                if (!pdfInfo.isLocal) {
                    logInfo(`Extracting text from remote PDF URL: ${pdfInfo.uri}`);
                    formData.append('File', {
                        uri: pdfInfo.uri,
                        name: 'document.pdf',
                        type: 'application/pdf',
                    });
                } else {
                    logInfo(`Extracting text from local PDF file: ${pdfInfo.uri}`);
                    formData.append('File', {
                        uri: pdfInfo.uri,
                        name: pdfInfo.name || 'document.pdf',
                        type: 'application/pdf',
                    });
                }

                logInfo(`Sending request to ConvertAPI for text extraction using API key ${apiSecret}...`);
                const response = await axios.post(url, formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        Accept: 'application/json',
                    },
                    timeout: 60000,
                });

                if (!response.data?.Files?.[0]?.FileData) {
                    throw new Error('Invalid response structure from ConvertAPI');
                }

                const base64TextData = response.data.Files[0].FileData;
                const decodedText = Buffer.from(base64TextData, 'base64').toString('utf-8');
                return decodedText;
            } catch (error) {
                logError(`Text extraction attempt ${attempt + 1} failed: ${error.message}`);
                if (attempt === retries - 1) throw error;
                logInfo(`Retrying in ${Math.pow(2, attempt) * 1000}ms...`);
                await delay(Math.pow(2, attempt) * 1000);
            }
        }
    } catch (error) {
        logError(`Error during text extraction: ${error.message}`);
        throw error;
    } finally {
        console.log('goods');
    }
};

// Function to extract text directly from a PDF with enhanced logging and proper URI handling
export const extractTextDirectlyFromPdf = async (pdfInfo, logInfo, logError, retries = 3) => {
    let apiSecret;
    try {
        // Get an available API key
        apiSecret = getRandomApiKey();
        const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

        for (let attempt = 0; attempt < retries; attempt++) {
            try {
                logInfo(`Attempt ${attempt + 1} of ${retries} to extract text from PDF`);
                const url = `${API_BASE_URL}/convert/pdf/to/txt?Secret=${apiSecret}`;
                
                // Read the file content without removing 'file://' scheme
                logInfo(`Reading file from: ${pdfInfo.uri}`);
                let fileContent;
                try {
                    fileContent = await FileSystem.readAsStringAsync(pdfInfo.uri, { 
                        encoding: FileSystem.EncodingType.Base64,
                    });
                    logInfo(`Successfully read file content, length: ${fileContent.length}`);
                } catch (readError) {
                    logError(`Error reading file: ${readError.message}`);
                    throw readError;
                }

                // Create form data with proper file structure
                const formData = new FormData();
                const fileBlob = {
                    uri: pdfInfo.uri, 
                    type: 'application/pdf',
                    name: pdfInfo.name || 'document.pdf',
                };

                formData.append('File', fileBlob);

                logInfo(`Sending request to ConvertAPI for direct text extraction using API key ${apiSecret}...`);
                const response = await axios.post(url, formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        Accept: 'application/json',
                    },
                    timeout: 60000,
                    validateStatus: status => status < 500, 
                });

                if (response.status !== 200) {
                    logError(`API responded with status ${response.status}`);
                    logError(`Response data: ${JSON.stringify(response.data)}`);
                    throw new Error(`API responded with status ${response.status}`);
                }

                if (!response.data?.Files?.[0]?.FileData) {
                    logError('Invalid response structure from ConvertAPI');
                    logError(`Response data: ${JSON.stringify(response.data)}`);
                    throw new Error('Invalid response structure from ConvertAPI');
                }

                const base64TextData = response.data.Files[0].FileData;
                const decodedText = Buffer.from(base64TextData, 'base64').toString('utf-8');

                logInfo(`Successfully extracted text, length: ${decodedText.length}`);
                return decodedText;

            } catch (error) {
                logError(`Extraction attempt ${attempt + 1} failed: ${error.message}`);
                
                if (error.response) {
                    logError(`Response status: ${error.response.status}`);
                    logError(`Response data: ${JSON.stringify(error.response.data)}`);
                }
                
                if (attempt === retries - 1) throw error;
                
                const delayTime = Math.pow(2, attempt) * 1000;
                logInfo(`Retrying in ${delayTime}ms...`);
                await delay(delayTime);
            }
        }
    } catch (error) {
        logError(`Error during direct text extraction: ${error.message}`);
        throw error;
    } finally {
        console.log('goods');
    }
};

// Function to convert various file types to TXT
export const convertToTxt = async (file, logInfo, logError) => {
    let apiSecret;
    try {
        // Get an available API key
        apiSecret = getRandomApiKey();
        const fromFormat = getFileFormat(file.name);
        logInfo(`Converting ${fromFormat} file to text: ${file.name}`);

        const url = `${API_BASE_URL}/convert/${fromFormat}/to/txt?Secret=${apiSecret}`;
        const formData = new FormData();

        // Determine MIME type using custom function
        const mimeType = getMimeType(file.name);
        logInfo(`MIME type for ${file.name}: ${mimeType}`);

        // Append the file to FormData with the correct structure
        formData.append('File', {
            uri: file.uri,
            name: file.name,
            type: mimeType,
        });

        logInfo(`Sending request to ConvertAPI for text conversion using API key ${apiSecret}...`);
        const response = await axios.post(url, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
                Accept: 'application/json',
            },
            timeout: 60000,
        });

        if (!response.data?.Files?.[0]?.FileData) {
            throw new Error('Invalid response structure from ConvertAPI');
        }

        const base64TextData = response.data.Files[0].FileData;
        const decodedText = Buffer.from(base64TextData, 'base64').toString('utf-8');
        
        if (!decodedText.trim()) {
            throw new Error('Converted TXT is empty.');
        }

        logInfo(`Successfully converted ${file.name} to text, length: ${decodedText.length}`);
        return decodedText;

    } catch (error) {
        logError(`Error converting ${file.name} to text: ${error.message}`);
        throw error;
    } finally {
      console.log('goods');
    }
};
