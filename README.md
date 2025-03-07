# QuickEase-Mobile

In today’s academic environment, students often struggle to balance their study sessions due to non-academic responsibilities that demand significant time and energy. Additionally, tasks like manually summarizing study materials and creating self-assessment tools, such as flashcards and quizzes, consume a lot of time and effort, reducing the effectiveness of their study sessions. To address these challenges, the QuickEase mobile application was developed to streamline students’ study sessions. 

The system uses technologies such as OpenAI GPT-4o, Google Vision, and ConvertAPI, allowing students to upload study materials in various formats and automatically generate summaries, flashcards, and quizzes. Additional features, including a Pomodoro Timer and a Gamified Badge System, help boost productivity, motivation, and engagement. The user testing showed an average System Usability Scale (SUS) score of 82.29, categorized as "Excellent," while ISO/IEC 25010 evaluations highlighted strong functional suitability and usability. These results conclude that QuickEase successfully addressed key challenges in streamlining students’ study sessions. Future improvements include extending availability to iOS and introducing an AI chatbot for additional study assistance.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js**: Version 12.2.0 or higher. You can download it from the [official website](https://nodejs.org/).
- **Expo CLI**: Install globally using npm:
  
  ```bash
  npm install -g expo-cli
  ```
- **Package Manager**: Either npm (comes with Node.js) or Yarn.
- **Expo Go App** (for testing on a real device):
  - **Android**: Available on the Google Play Store.
  - **iOS**: Available on the App Store.

## Installation

### Clone the Repository:

```bash
git clone https://github.com/Lonergun141/QuickEase-Mobile.git
cd QuickEase-Mobile
```

### Install Dependencies:

Using npm:

```bash
npm install
```

Or using Yarn:

```bash
yarn install
```

### Set Up Environment Variables:

1. Create a `.env` file in the root directory.
2. Add necessary API keys or environment-specific variables based on the application's requirements.

## Running the Application

To start the Expo development server:

Using npx:

```bash
npx expo start
```

This command will open the Expo Developer Tools in your default browser and display a QR code.

## Running on a Physical Device

1. Ensure your mobile device and computer are connected to the same Wi-Fi network.
2. Open the **Expo Go** app on your mobile device.
3. Scan the QR code displayed in the terminal or the Expo Developer Tools.

The app will launch on your mobile device.
