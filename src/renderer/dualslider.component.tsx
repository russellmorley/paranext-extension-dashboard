import { useState } from "react";

export type SliderProps = {
  min: number;
  max: number;
  notInRangeColor: string;
  inRangeColor: string;
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
    notInRangeColor = '#dadae5',
    inRangeColor = '#3264fe',
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
  const minPos = ((leftSliderPosition - min) / (max - min)) * 100;
  const maxPos = ((rightSliderPosition - min) / (max - min)) * 100;

  return (
    <div className="wrapper">
      <div className="track-wrapper">
        <div className="thumb" style={{ left: `${minPos}%` }} >
        </div>
        <div className="track" >
          {/* <div className="inner-track" style={{ left: `${minPos}%`, right: `${100 - maxPos}%` }} > */}
          <div className="inner-track" style={{ left: `${min}%`, right: `${100-minPos}%` }} >
          </div>
          <div className="inner-track" style={{ left: `${maxPos}%`, right: `${max}%` }} >
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
