import { MutableRefObject, useEffect, useRef, useState } from "react";

export type SliderProps = {
  min: number;
  max: number;
  mean?: number
  leftColor: string;
  middleColor: string;
  rightColor: string;
  leftSliderPosition: number;
  rightSliderPosition: number;
  minimumGap: number;
  step: number;
  onRangeChanged: (leftPosition: number, rightPosition: number) => void;
}

export function DualSlider(
  {
    min = 0,
    max = 100,
    mean,
    leftColor = '#dadae5',
    middleColor = '#3264fe',
    rightColor = '#3264fe',
    leftSliderPosition = 25,
    rightSliderPosition = 75,
    minimumGap = 5,
    step = 5,
    onRangeChanged
  }: SliderProps) {
  const [sliderStyleBackground, setSliderStyleBackground] = useState({});

  const minBubbleRef = useRef({} as HTMLOutputElement);

  const leftSliderBubbleRef = useRef({} as HTMLOutputElement);
  const leftRangeRef = useRef({} as HTMLInputElement);
  const leftTrackRef = useRef({} as HTMLDivElement);

  const middleTrackRef = useRef({} as HTMLDivElement);
  const meanBubbleRef = useRef({} as HTMLOutputElement);

  const rightSliderBubbleRef = useRef({} as HTMLOutputElement);
  const rightRangeRef = useRef({} as HTMLInputElement);
  const rightTrackRef = useRef({} as HTMLDivElement);

  const maxBubbleRef = useRef({} as HTMLOutputElement);

  function setBubble(input: HTMLInputElement, output: HTMLOutputElement) {

    const val = parseFloat(input.value);
    const min = input.min ? parseFloat(input.min) : 0;
    const max = input.max ? parseFloat(input.max) : 100;
    const newVal = Number(((val - min) * 100) / (max - min));
    output.innerHTML = (Math.round(val * 100) / 100).toString();
    output.style.left = `calc(${newVal}% + (${10 - newVal * 0.2}px))`;
  }

  function handleLeftInput(event: React.ChangeEvent<HTMLInputElement>) {
    setBubble(event.target, leftSliderBubbleRef.current);
  }
  function handleRightInput(event: React.ChangeEvent<HTMLInputElement>) {
    setBubble(event.target, rightSliderBubbleRef.current );
  }

  function handleLeftChange(event: React.ChangeEvent<HTMLInputElement>) {
    event.preventDefault();
    onRangeChanged(Math.min(parseFloat(event.target.value), rightSliderPosition - minimumGap), rightSliderPosition);
  }
  function handleRightChange(event: React.ChangeEvent<HTMLInputElement>) {
    event.preventDefault();
    onRangeChanged(leftSliderPosition, Math.max(parseFloat(event.target.value), leftSliderPosition + minimumGap));
  }
  max = Math.ceil((max - min)/step) * step + min; //make sure step can reach max.
  const minPos = ((leftSliderPosition - min) / (max - min)) * 100;
  const maxPos = ((rightSliderPosition - min) / (max - min)) * 100;

  let meanPos = 0;
  if (mean)
   meanPos = ((mean - min) / (max - min)) * 100;

  useEffect(() => {
    minBubbleRef.current.style.background = leftColor;
    minBubbleRef.current.innerHTML = (Math.round(min * 100) / 100).toString();

    leftTrackRef.current.style.background = leftColor;
    leftSliderBubbleRef.current.style.background = leftColor;
    setBubble(leftRangeRef.current, leftSliderBubbleRef.current );

    middleTrackRef.current.style.background = middleColor;
    if (mean) {
      //meanBubbleRef.current.style.left = `calc(${mean}% + (${10 - mean * 0.2}px))`;
      meanBubbleRef.current.innerHTML = (Math.round(mean * 100) / 100).toString();
      meanBubbleRef.current.style.background = middleColor;
    } else {
      meanBubbleRef.current.style.left = "-10000px"
    }

    rightTrackRef.current.style.background = rightColor;
    rightSliderBubbleRef.current.style.background = rightColor;
    setBubble(rightRangeRef.current, rightSliderBubbleRef.current );

    maxBubbleRef.current.innerHTML = (Math.round(max * 100) / 100).toString();
    maxBubbleRef.current.style.background = rightColor;
  });

  return (
    <div className="wrapper">
      <div className="track-wrapper">
        <div className="thumb" style={{ left: `${minPos}%` }} >
        </div>
        <div className="track" ref={middleTrackRef} >
          <div className="left-track" ref={leftTrackRef} style={{ left: `${0}%`, right: `${100-minPos}%` }} >
          </div>
          <div className="right-track" ref={rightTrackRef} style={{ left: `${maxPos}%`, right: `${0}%` }} >
          </div>
        </div>
        <div className="thumb" style={{ left: `${maxPos}%` }} />
      </div>
      <div className="range-wrapper">
        <output ref={minBubbleRef} title={`Minimum: ${min}`} className="bubble-min"></output>

        <input className="range" ref={leftRangeRef} type="range" min={min} max={max} step={step} value={leftSliderPosition} onChange={handleLeftChange} onInput={handleLeftInput} />
        <output ref={leftSliderBubbleRef} className="bubble-thumb-left"></output>

        <output ref={meanBubbleRef} title={`Mean: ${mean}`} className="bubble-mean" style={{ left: `${meanPos}%` }}></output>

        <input className="range" type="range" ref={rightRangeRef} min={min} max={max} step={step} value={rightSliderPosition} onChange={handleRightChange} onInput={handleRightInput}/>
        <output ref={rightSliderBubbleRef} className="bubble-thumb-right"></output>

        <output ref={maxBubbleRef} title={`Maximum: ${max}`} className="bubble-max"></output>
      </div>
    </div>
  );
}
