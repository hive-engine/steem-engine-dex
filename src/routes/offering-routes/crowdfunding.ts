/* eslint-disable @typescript-eslint/no-use-before-define */
import styles from "./crowdfunding.module.css";
import { customElement, bindable } from "aurelia-framework";
import { faClock } from "@fortawesome/pro-solid-svg-icons";
import { slick } from "slick-carousel/slick/slick";
import { typewriter } from "typewriter-effect/dist/core";
import { Callback } from "i18next";


export class Crowdfunding {
    @bindable iconClock = faClock;

    private Slick = slick;
    private Typewriter = typewriter;
    private styles = styles;

    addClass(clss: string) {
        const app = document.getElementById('app');

        // @ts-ignore
        const typewriter = new typewriter(app, {
            loop: true
        });

        typewriter.typeString('Hello World!')
            .pauseFor(2500)
            .deleteAll()
            .typeString('Strings can be removed')
            .pauseFor(2500)
            .deleteChars(7)
            .typeString('<strong>altered!</strong>')
            .pauseFor(2500)
            .start();
        console.log(clss);
    }

    attached() {
        // @ts-ignore
        $(".exploration-cards").slick({
            dots: true,
            arrows: true,
            infinite: false,
            speed: 300,
            autoplay: true,
            slidesToShow: 3,
            slidesToScroll: 1,
            responsive: [
                {
                    breakpoint: 1024,
                    settings: {
                        slidesToShow: 3,
                        slidesToScroll: 3,
                        infinite: true,
                        dots: true
                    }
                },
                {
                    breakpoint: 600,
                    settings: {
                        slidesToShow: 2,
                        slidesToScroll: 2
                    }
                },
                {
                    breakpoint: 480,
                    settings: {
                        slidesToShow: 1,
                        slidesToScroll: 1
                    }
                }
                // You can unslick at a given breakpoint now by adding:
                // settings: "unslick"
                // instead of a settings object
            ]
        });
        
    }


        
    

}
