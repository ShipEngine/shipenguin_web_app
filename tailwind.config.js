module.exports = {
    theme: {
        inset: {
            "29": "6.25rem",
            "32": "8rem",
            "36": "9rem",
            "44": "11rem",
            "62": "15.5rem",
            "78": "19.5rem"
        },
        extend: {
            screens: {
                'xl': {'max': '1279px'},
                // => @media (max-width: 1279px) { ... }

                'lg': {'max': '1023px'},
                // => @media (max-width: 1023px) { ... }
          
                'md': {'max': '767px'},
                // => @media (max-width: 767px) { ... }
          
                'sm': {'max': '639px'},
                // => @media (max-width: 639px) { ... }
            },
            colors: {
                "blue-background": "#72cbd3",
                "gray-background": "#dbf0f2",
                "green-button": "#00b89d",
                "green-hover": "#00a38b",
                "blue-container": "#effafd",
                "cerulean-blue": "#294ccb"
            },
            fontFamily: {
                primary: ["Roboto", "sans-serif"]
            },
            backgroundImage: theme => ({
                "usps-label": "url('../../images/usps-label.png')"
            }),
            height: {
                smallLabelHeight: "32rem",
                labelHeight: "40rem"
            },
            width: {
                smallLabelWidth: "24rem",
                labelWidth: "30rem"
            }
        }
    }
}