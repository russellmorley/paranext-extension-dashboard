import papi, { logger } from '@papi/frontend';
import { useData, useDataProvider, useEvent } from '@papi/frontend/react';
import { useCallback, useEffect, useState } from 'react';
import type { DoStuffEvent, DashboardVerseChangeEvent } from 'paranext-extension-dashboard';
import { Button } from 'papi-components';
import Chart from 'react-apexcharts';
import { ApexOptions } from 'apexcharts';
import { AquaService, httpRequester, Result } from './services/aqua.service';

globalThis.webViewComponent = function Dashboard() {
  const [clicks, setClicks] = useState(0);
  const [dashboardVerseRef, setDashboardVerseRef] = useState('');
  // const [verseOffset, setVerseOffset] = useState(0);
  const [results, setResults] = useState([] as any[]);
  const [chartOptions, setChartOptions] = useState({
    plotOptions: {
      heatmap: {
        colorScale: {
          ranges: [{
              from: -30,
              to: 5,
              color: '#00A100',
              name: 'low',
            },
            {
              from: 6,
              to: 20,
              color: '#128FD9',
              name: 'medium',
            },
            {
              from: 21,
              to: 45,
              color: '#FFB200',
              name: 'high',
            }
          ]
        }
      },
    },
    legend: {
      show: false,
    }
  } as ApexOptions);

  useEvent<DoStuffEvent>(
    'extensionDashboard.doStuff',
    useCallback(({ count }) => setClicks(count), []),
  );

  useEvent<DashboardVerseChangeEvent>(
    'platform.dashboardVerseChange',
    useCallback(({ verseRefString, verseOffsetIncluded }) => {
      setDashboardVerseRef(verseRefString);
      console.log(`Received verse update from dashboard ${verseRefString} ${verseOffsetIncluded}`);
      }, []),
  );
  const extensionVerseDataProvider = useDataProvider('paranextExtensionTemplate.quickVerse');

  const [latestExtensionVerseText] = useData<'paranextExtensionTemplate.quickVerse'>(
    extensionVerseDataProvider,
  ).Verse('latest', 'Loading latest Scripture text from extension template...');

  const [latestQuickVerseText] = useData('quickVerse.quickVerse').Verse(
    'latest',
    'Loading latest Scripture text from extension template...',
  );

  const assessmentId: string = window.getWebViewState('assessment_id') ?? '<not set>';
  const versionId: string = window.getWebViewState('version_id') ?? '<not set>';



  useEffect(() => {
    async function getResults() {
      try {
        const results = await   new AquaService(
          'https://fxmhfbayk4.us-east-1.awsapprunner.com/v2',
          {
            // mode: 'no-cors',
            headers: {
              "api_key": "7cf43ae52dw8948ddb663f9cae24488a4",
              // origin: "https://fxmhfbayk4.us-east-1.awsapprunner.com",
            },
            // credentials: "include",
          },
          httpRequester,
        ).ListResults(parseInt(assessmentId));
        console.log(results);
      } catch(e) {
        console.error(e);
      }
      setResults([{
        name: "Series 1",
        data: [{
          x: 'W1',
          y: -3
        }, {
          x: 'W2',
          y: 2
        }, {
          x: 'W3',
          y: 45
        }, {
          x: 'W4',
          y: 0
        }]
      },
      {
        name: "Series 2",
        data: [{
          x: 'W1',
          y: -44
        }, {
          x: 'W2',
          y: 6
        }, {
          x: 'W3',
          y: -4
        }, {
          x: 'W4',
          y: 9
        }]
      }]);
    }
    getResults();
  }, []);

  return (
    <>
      <div className="title">
        <span className="medium">AQuA Analysis Results</span>&nbsp;&nbsp;<span className="medium bold">{dashboardVerseRef}</span>&nbsp;&nbsp;<span className="small">AssessmentId:  {assessmentId}&nbsp;&nbsp;VersionId: {versionId}</span>
      </div>
      {/* <div>{latestExtensionVerseText}</div>
      <div>{latestQuickVerseText}</div> */}
      {/* <div>AssessmentId: {assessmentId}</div>
      <div>VersionId: {versionId}</div>
      <div>Dashboard's Verse: {dashboardVerseRef}</div> */}
      <div>
        <Chart options={chartOptions} series={results} type="heatmap" height={200} />
      </div>
      <div>
        <span>
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
          <Button
            onClick={async () => {
              const start = performance.now();
              const result = await papi.commands.sendCommand(
                'platform.paranextVerseChange',
                'GEN 100:2000',
                1,
              );
              logger.info(
                `platform.paranextVerseChange '${result.response}' took ${
                  performance.now() - start
                } ms`,
              );
            }}
          >
          Tell Dashboard Paranext's verse changed
          </Button>
        </span>
      </div>
    </>
  );
};
