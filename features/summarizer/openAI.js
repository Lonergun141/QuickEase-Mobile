import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';

const IP = process.env.EXPO_PUBLIC_API_URL;
const API_BASE_URL = `https://quickease.xyz/quickease/api/v1`;
const OPENAI_API_KEY = process.env.EXPO_PUBLIC_OPNEAIKEY;
const GOOGLE_CLOUD_VISION_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_VISION_API_KEY;
const axiosInstance = axios.create({
	baseURL: API_BASE_URL,
});

axiosInstance.interceptors.request.use(
	async (config) => {
		try {
			const user = await AsyncStorage.getItem('user');
			const parsedUser = JSON.parse(user);
			if (parsedUser && parsedUser.access) {
				config.headers['Authorization'] = `Bearer ${parsedUser.access}`;
			}
		} catch (error) {
			console.error('Error parsing user data:', error);
		}
		return config;
	},
	(error) => Promise.reject(error)
);

export const generateSummary = async (formData) => {
	try {
		const response = await axiosInstance.post('/usernotes/', formData, {
			headers: {
				'Content-Type': 'application/json',
			},
		});
		return response.data;
	} catch (error) {
		console.error('hala basaha:', {
			data: error.response.data,
			status: error.response.status,
			headers: error.response.headers,
		});
		throw error;
	}
};

export const fetchNote = async (id) => {
	try {
		const response = await axiosInstance.get(`/usernotes/${id}/`);
		return response.data;
	} catch (error) {
		console.error('Error fetching note:', error);
		throw error;
	}
};

export const fetchAllNotes = async () => {
	try {
		const response = await axiosInstance.get('/usernotes/');
		return response.data;
	} catch (error) {
		console.error('Error fetching notes:', error);
		throw error;
	}
};

export const updateNote = async (id, noteData) => {
	try {
		const response = await axiosInstance.put(`/usernotes/${id}/`, noteData);
		return response.data;
	} catch (error) {
		if (error.response) {
			console.error('Error updating note:', {
				data: error.response.data,
				status: error.response.status,
				headers: error.response.headers,
			});
		} else if (error.request) {
			console.error('No response received:', error.request);
		} else {
			console.error('Error setting up request:', error.message);
		}
		throw error;
	}
};

export const deleteNote = async (id) => {
	try {
		await axiosInstance.delete(`/usernotes/${id}/`);
	} catch (error) {
		console.error('Error deleting note:', error);
		throw error;
	}
};

export const generateSummaryFromImages = async (files) => {
    const extractTextFromImage = async (base64Image) => {
        const visionApiUrl = `https://vision.googleapis.com/v1/images:annotate?key=${GOOGLE_CLOUD_VISION_API_KEY}`;
        const requestPayload = {
            requests: [
                {
                    image: {
                        content: base64Image,
                    },
                    features: [
                        {
                            type: 'TEXT_DETECTION',
                        },
                    ],
                },
            ],
        };

        try {
            const response = await axios.post(visionApiUrl, requestPayload);
            console.log('Google Vision API Response:', response.data);
            
            const annotations = response.data.responses[0]?.fullTextAnnotation?.text;
            return annotations || '';
        } catch (error) {
            if (error.response) {
                console.error('Error with Google Vision API:', error.response.data);
            } else if (error.request) {
                console.error('No response received from Google Vision API:', error.request);
            } else {
                console.error('Error setting up request to Google Vision API:', error.message);
            }
            throw error;
        }
    };

    let fullText = '';

    for (const file of files) {
        if (file.type?.includes('image')) {
            try {
                let base64;
                if (file.base64) {
                    base64 = file.base64;
                } else {
                    base64 = await FileSystem.readAsStringAsync(file.uri, {
                        encoding: FileSystem.EncodingType.Base64,
                    });
                }

                // Ensure base64 data does not include data URI prefix
                base64 = base64.replace(/^data:image\/[a-z]+;base64,/, '');

                const text = await extractTextFromImage(base64);
                if (text && text.trim()) {
                    // **Add <break> after each image's text**
                    fullText += text.trim() + '<break>';
					console.log(fullText);
                }
            } catch (error) {
                console.error('Error processing image file:', error);
            }
        } else {
            // **Process non-image files**
            try {
                const text = await convertToTxt(file);
                if (text && text.trim()) {
                    // The text from convertToTxt already includes <break> between pages
                    fullText += text.trim() + '<break>';
                }
            } catch (error) {
                console.error('Error processing non-image file:', error);
            }
        }
    }

    return fullText;
};


export const generateQuizFromSummary = async (summary) => {
	try {
		const response = await axios.post(
			'https://api.openai.com/v1/chat/completions',
			{
				model: 'gpt-4o',
				messages: [
					{
						role: 'system',
						content:
							'You are a helpful assistant that generates multiple-choice quizzes in pure JSON format. Return only JSON, without any code blocks, markdown, or extra characters.',
					},
					{
						role: 'user',
						content: `Generate a multiple-choice quiz based on the given summary. The number of questions should be exactly either "15 or 20" items only. 
						If the given summary is too short, generate 15. Else, generate 20 items if it's a long summary.
						
						Ensure the following:
						- Cover all major points and details, ensure an even distribution of topics.
						- Each question must have **1 correct answer** and **3 incorrect options (distractors)**.
						- The distractor should be plausible and reasonable.
						- The distractor should be realistic and relevant to the question. 
						- Incorporate common misconceptions.
						- Distractors should be similar in length and grammatical structure to avoid giving clues about the correct answer.
						- At least (20-30% application-based questions) that require applying the concepts from the summary to hypothetical scenarios or problem-solving.
						- Each question should only have one correct answer.

						(VERY IMPORTANT) Randomize the position of the correct answer among the four choices for each question. 
						(VERY IMPORTANT) Format the response as a JSON array of question objects with the following structure:

						[
							{
								"TestQuestion": "Question text here",
								"choices": [
									{
										"item_choice_text": "Choice text here",
										"isAnswer": boolean
									},
									{
										"item_choice_text": "Choice text here",
										"isAnswer": boolean
									},
									{
										"item_choice_text": "Choice text here",
										"isAnswer": boolean
									},
									{
										"item_choice_text": "Choice text here",
										"isAnswer": boolean
									}
								]
							}
						]

						Ensure the following:
						- At least (20-30% application-based questions) that require applying the concepts from the summary to hypothetical scenarios or problem-solving.
						- Integrate (misleading distractors) that incorporate common misconceptions, subtle differences, or related but incorrect concepts to challenge the test-taker's understanding.
						- Use subtle phrasing for incorrect choices to avoid making them easy to rule out. 
						- Include common pitfalls, related concepts, or nuanced differences that might mislead someone unfamiliar with the material.
						
						The quiz should be based on the following summary:
						
						"${summary}"
						
						Make sure to cover all relevant content in the summary and generate enough questions to test knowledge across all key areas. Do not provide any explanation or extra formatting outside the JSON structure.`,
					},
				],
				max_tokens: 5000, 
			},
			{
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${OPENAI_API_KEY}`,
				},
			}
		);

		const quizData = JSON.parse(response.data.choices[0].message.content.trim());
		return quizData;
	} catch (error) {
		// Log a detailed error response
		if (error.response) {
			// The request was made, and the server responded with a status code
			// that falls out of the range of 2xx
			console.error('Error response data:', error.response.data);
			console.error('Error response status:', error.response.status);
			console.error('Error response headers:', error.response.headers);
			throw new Error(
				`Error generating quiz: ${error.response.status} - ${error.response.data.error.message || error.response.data}`
			);
		} else if (error.request) {
			// The request was made but no response was received
			console.error('No response received:', error.request);
			throw new Error('Error generating quiz: No response received from OpenAI API.');
		} else {
			// Something happened in setting up the request that triggered an Error
			console.error('Error message:', error.message);
			throw new Error(`Error generating quiz: ${error.message}`);
		}
	}
};
