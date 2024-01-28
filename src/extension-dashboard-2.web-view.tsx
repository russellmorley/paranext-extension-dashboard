import papi, { logger } from '@papi/frontend';
import { useData, useDataProvider, useEvent } from '@papi/frontend/react';
import { useCallback, useState } from 'react';
import type { DoStuffEvent, DashboardVerseChangeEvent } from 'paranext-extension-dashboard';
import { Button } from 'papi-components';
import ReactApexChart from 'react-apexcharts';
import { ApexOptions } from 'apexcharts';

globalThis.webViewComponent = function Dashboard() {
  const [clicks, setClicks] = useState(0);

  useEvent<DoStuffEvent>(
    'extensionDashboard.doStuff',
    useCallback(({ count }) => setClicks(count), []),
  );

  const [verseRef, setVerseRef] = useState('');
  // const [verseOffset, setVerseOffset] = useState(0);

  useEvent<DashboardVerseChangeEvent>(
    'platform.verseChange',
    useCallback(({ verseRefString, verseOffsetIncluded }) => setVerseRef(verseRefString), []),
  );
  const extensionVerseDataProvider = useDataProvider('paranextExtensionTemplate.quickVerse');

  const [latestExtensionVerseText] = useData<'paranextExtensionTemplate.quickVerse'>(
    extensionVerseDataProvider,
  ).Verse('latest', 'Loading latest Scripture text from extension template...');

  const [latestQuickVerseText] = useData('quickVerse.quickVerse').Verse(
    'latest',
    'Loading latest Scripture text from extension template...',
  );

  const analysisType: string = window.getWebViewState('analysis_type') ?? '<not set>';

  const chartOptions : ApexOptions = {
    // Define your chart options here
    chart: {
      type: 'line',
    },
    series: [
      {
        name: 'Series 1',
        data: [30, 40, 35, 50, 49, 60, 70, 91, 125],
      },
    ],
    xaxis: {
      categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'],
    },
  };

  return (
    <>
      <div className="title">
        Extension for Dashboard <span className="framework">React</span>
      </div>
      {/* <div>{latestExtensionVerseText}</div>
      <div>{latestQuickVerseText}</div> */}
      <div>Analysis Type: {analysisType}</div>
      <div>Verse: {verseRef}</div>
      <div>
        <Button
          onClick={async () => {
            const start = performance.now();
            const result = await papi.commands.sendCommand(
              'extensionDashboard.doStuff',
              'Extension for Dashboard React Component',
            );
            setClicks(clicks + 1);
            logger.info(
              `command:extensionDashboard.doStuff '${result.response}' took ${
                performance.now() - start
              } ms`,
            );
          }}
        >
          I've been clicked {clicks} time(s)
        </Button>
      </div>
      <div>
        <ReactApexChart
          options={chartOptions}
          series={chartOptions.series}
          type="line"
          height={350}
      />
      </div>
    </>
  );
};
