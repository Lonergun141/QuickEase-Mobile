/** @type {import('tailwindcss').Config} */
module.exports = {
	darkMode: 'selector',
	content: ['./app/**/*.{js,jsx,ts,tsx}', './components/**/*.{js,jsx,ts,tsx}'],
	theme: {
		extend: {
			colors: {
				primary: '#63A7FF',
				secondary: '#F6F7FB',
				highlights: '#213660',
				secondhighlights: '#060321',
				backgroundColor: '#FFFFFF',
				onBoardingbg: '#DEECFA',
				pomodoro: '#7EC3FA',
				review: '#EE924F',
				dark: '#171717',
				nimal: '#212121',
				naeg: '#C0C0C0',
				darkSecondary: '#424242',
			},
			fontFamily: {
				pthin: ['Poppins-Thin', 'sans-serif'],
				pextralight: ['Poppins-ExtraLight', 'sans-serif'],
				plight: ['Poppins-Light', 'sans-serif'],
				pregular: ['Poppins-Regular', 'sans-serif'],
				pmedium: ['Poppins-Medium', 'sans-serif'],
				psemibold: ['Poppins-SemiBold', 'sans-serif'],
				pbold: ['Poppins-Bold', 'sans-serif'],
				pextrabold: ['Poppins-ExtraBold', 'sans-serif'],
				pblack: ['Poppins-Black', 'sans-serif'],
				Inc: ['IncompleetaRegular'],
			},
		},
	},
	plugins: [],
};
