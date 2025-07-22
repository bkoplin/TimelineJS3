import { gsap } from 'gsap'

import { CustomEase } from 'gsap/CustomEase'

import { Draggable } from 'gsap/Draggable'
import { DrawSVGPlugin } from 'gsap/DrawSVGPlugin'
import { EaselPlugin } from 'gsap/EaselPlugin'
import { Flip } from 'gsap/Flip'
import { GSDevTools } from 'gsap/GSDevTools'
import { InertiaPlugin } from 'gsap/InertiaPlugin'
import { MorphSVGPlugin } from 'gsap/MorphSVGPlugin'
import { MotionPathHelper } from 'gsap/MotionPathHelper'
import { MotionPathPlugin } from 'gsap/MotionPathPlugin'
import { Observer } from 'gsap/Observer'
import { Physics2DPlugin } from 'gsap/Physics2DPlugin'
import { PhysicsPropsPlugin } from 'gsap/PhysicsPropsPlugin'
import { PixiPlugin } from 'gsap/PixiPlugin'
import { ScrambleTextPlugin } from 'gsap/ScrambleTextPlugin'
// ScrollSmoother requires ScrollTrigger
import { ScrollSmoother } from 'gsap/ScrollSmoother'
import { ScrollToPlugin } from 'gsap/ScrollToPlugin'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'
import { TextPlugin } from 'gsap/TextPlugin'
import { App } from 'vue'

gsap.registerPlugin(Draggable, DrawSVGPlugin, EaselPlugin, Flip, GSDevTools, InertiaPlugin, MotionPathHelper, MotionPathPlugin, MorphSVGPlugin, Observer, Physics2DPlugin, PhysicsPropsPlugin, PixiPlugin, ScrambleTextPlugin, ScrollTrigger, ScrollSmoother, ScrollToPlugin, SplitText, TextPlugin, CustomEase, InertiaPlugin)
export { Draggable, InertiaPlugin, MotionPathHelper, ScrollSmoother, ScrollToPlugin, ScrollTrigger, SplitText }
export { gsap }
