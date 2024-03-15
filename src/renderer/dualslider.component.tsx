import { useEffect, useState } from "react";

export type SliderProps = {
  min: number;
  max: number;
  leftColor: string;
  middleColor: string;
  rightColor: string;
  leftSliderPosition: number;
  rightSliderPosition: number;
  minimumGap: number;
  step: number
  onRangeChanged: (leftPosition: number, rightPosition: number) => void;
}

export function DualSlider(
  {
    min = 0,
    max = 100,
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

  function handleLeftSlider(event: React.ChangeEvent<HTMLInputElement>) {
    event.preventDefault();
    onRangeChanged(Math.min(parseFloat(event.target.value), rightSliderPosition - minimumGap), rightSliderPosition);
  }
  function handleRightSlider(event: React.ChangeEvent<HTMLInputElement>) {
    event.preventDefault();
    onRangeChanged(leftSliderPosition, Math.max(parseFloat(event.target.value), leftSliderPosition + minimumGap));
  }
  max = Math.ceil((max - min)/step) * step + min; //make sure step can reach max.
  const minPos = ((leftSliderPosition - min) / (max - min)) * 100;
  const maxPos = ((rightSliderPosition - min) / (max - min)) * 100;

  useEffect(() => {
    const leftTrackElement = document.querySelector('.left-track') as HTMLElement;
    if (leftTrackElement)
      leftTrackElement.style.background = leftColor;

    const middleTrackElement = document.querySelector('.track') as HTMLElement;
    if (middleTrackElement)
    middleTrackElement.style.background = middleColor;

    const rightTrackElement = document.querySelector('.right-track') as HTMLElement;
    if (rightTrackElement)
      rightTrackElement.style.background = rightColor;
  });

  return (
    <div className="wrapper">
      <div className="track-wrapper">
        <div className="thumb" style={{ left: `${minPos}%` }} >
        </div>
        <div className="track" >
          <div className="left-track" style={{ left: `${0}%`, right: `${100-minPos}%` }} >
          </div>
          <div className="right-track" style={{ left: `${maxPos}%`, right: `${0}%` }} >
          </div>
        </div>
        <div className="thumb" style={{ left: `${maxPos}%` }} />
      </div>
      <div className="range-wrapper">
          <input className="range" type="range" min={min} max={max} step={step} value={leftSliderPosition} onChange={handleLeftSlider} />
          <input className="range" type="range" min={min} max={max} step={step} value={rightSliderPosition} onChange={handleRightSlider} />
      </div>
    </div>
  );
}
