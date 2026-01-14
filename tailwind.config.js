/** @type {import('tailwindcss').Config} */
import colors from 'tailwindcss/colors';

export default {
    content: ['./src/**/*.{html,js,svelte,ts}'],
    theme: {
        extend: {
            colors: {
                primary: colors.indigo[500],
                bgPrimary: colors.slate[900],
                bgSecondary: colors.slate[800],
                bgInput: colors.slate[700],
                textPrimary: colors.slate[50],
                textSecondary: colors.slate[300],
            },
            spacing: {
                safe: "2.75rem",
            },
            borderRadius: {
                card: "0.5rem",
            },
            screens: {
                'xs': '480px',
            },
        },
    },
    plugins: [],
}
