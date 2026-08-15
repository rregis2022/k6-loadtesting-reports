const REPORT_BASE_URL = "./reports/";


/*
 * Load report index
 */
async function loadReportIndex() {

    const response = await fetch(
        `${REPORT_BASE_URL}index.json?cache=${Date.now()}`,
        {
            cache: "no-store"
        }
    );

    if (!response.ok) {
        throw new Error(
            `Unable to load reports/index.json (${response.status})`
        );
    }

    return await response.json();
}


/*
 * Load an individual k6 JSON report
 */
async function loadReport(filename) {

    const response = await fetch(
        `${REPORT_BASE_URL}${encodeURIComponent(filename)}?cache=${Date.now()}`,
        {
            cache: "no-store"
        }
    );

    if (!response.ok) {
        throw new Error(
            `Unable to load ${filename} (${response.status})`
        );
    }

    return await response.json();
}


/*
 * Extract k6 metrics
 */
function extractMetrics(report) {

    const metrics = report.metrics || {};

    const duration =
        metrics.http_req_duration || {};

    const requests =
        metrics.http_reqs || {};

    const failed =
        metrics.http_req_failed || {};

    const vus =
        metrics.vus || {};

    return {

        vus:
            Number(vus.value ?? vus.max ?? 0),

        requests:
            Number(requests.count ?? 0),

        requestRate:
            Number(requests.rate ?? 0),

        average:
            Number(duration.avg ?? 0),

        median:
            Number(duration.med ?? 0),

        p90:
            Number(duration["p(90)"] ?? 0),

        p95:
            Number(duration["p(95)"] ?? 0),

        max:
            Number(duration.max ?? 0),

        failureRate:
            Number(failed.value ?? 0)

    };
}


/*
 * Extract date/time from filename
 *
 * Example:
 *
 * k6_url-summary-run-19-20260813-224627-142295608.json
 *
 */
function getReportDate(filename) {

    const match =
        filename.match(
            /(\d{8})-(\d{6})/
        );

    if (!match) {

        /*
         * Generic files such as:
         *
         * test.json
         * k6_url-summary.json
         *
         */

        return "Unknown";
    }


    const date =
        match[1];

    const time =
        match[2];


    const year =
        date.substring(0, 4);

    const month =
        date.substring(4, 6);

    const day =
        date.substring(6, 8);


    const hour =
        time.substring(0, 2);

    const minute =
        time.substring(2, 4);

    const second =
        time.substring(4, 6);


    return `${year}-${month}-${day} ${hour}:${minute}:${second}`;
}


/*
 * Extract run number
 *
 * Example:
 *
 * k6_url-summary-run-19-20260813...
 *
 * returns:
 *
 * 19
 */
function getRunNumber(filename) {

    const match =
        filename.match(
            /run-(\d+)/
        );

    if (!match) {
        return "-";
    }

    return match[1];
}


/*
 * Determine dashboard status
 *
 * DEMO thresholds
 */
function getStatus(failureRate) {

    if (failureRate > 5) {
        return "fail";
    }

    if (failureRate > 1) {
        return "warn";
    }

    return "pass";
}


const STATUS_LABEL = {

    pass: "PASS",

    warn: "DEGRADED",

    fail: "FAIL"

};


/*
 * Format milliseconds
 */
function formatMilliseconds(value) {

    if (!Number.isFinite(value)) {
        return "-";
    }

    return `${value.toFixed(2)} ms`;
}


/*
 * Format percentage
 */
function formatPercentage(value) {

    if (!Number.isFinite(value)) {
        return "0.00%";
    }

    return `${value.toFixed(2)}%`;
}


/*
 * Render one table row
 */
function renderRun(filename, report) {

    const metrics =
        extractMetrics(report);


    const date =
        getReportDate(filename);


    const runNumber =
        getRunNumber(filename);


    const errorRate =
        metrics.failureRate * 100;


    const status =
        getStatus(errorRate);


    const reportUrl =
        `${REPORT_BASE_URL}${encodeURIComponent(filename)}`;


    return `

        <tr>

            <td>
                <strong>#${runNumber}</strong>
            </td>


            <td>
                ${date}
            </td>


            <td>
                ${metrics.vus}
            </td>


            <td>
                ${Number(
                    metrics.requests
                ).toLocaleString()}
            </td>


            <td>
                ${metrics.requestRate.toFixed(2)}
            </td>


            <td>
                ${formatMilliseconds(
                    metrics.average
                )}
            </td>


            <td>
                <strong>
                    ${formatMilliseconds(
                        metrics.p95
                    )}
                </strong>
            </td>


            <td>
                ${formatMilliseconds(
                    metrics.max
                )}
            </td>


            <td>
                ${formatPercentage(
                    errorRate
                )}
            </td>


            <td>

                <span class="status-badge ${status}">
                    ${STATUS_LABEL[status]}
                </span>

            </td>


            <td>

                <a
                    href="${reportUrl}"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="report-link"
                >
                    View JSON
                </a>

            </td>

        </tr>

    `;
}


/*
 * Show dashboard error
 */
function showError(message) {

    const runsEl =
        document.getElementById("runs");


    const statusEl =
        document.getElementById("status");


    const errorEl =
        document.getElementById("errorMessage");


    runsEl.innerHTML = `

        <tr>

            <td
                colspan="11"
                class="empty"
            >

                ❌ ${message}

            </td>

        </tr>

    `;


    statusEl.textContent =
        "Unable to load reports";


    errorEl.hidden = false;


    errorEl.textContent =
        message;
}


/*
 * Initialize dashboard
 */
async function init() {

    const runsEl =
        document.getElementById("runs");


    const runCount =
        document.getElementById("runCount");


    const statusEl =
        document.getElementById("status");


    try {

        /*
         * Initial loading message
         */
        runsEl.innerHTML = `

            <tr>

                <td
                    colspan="11"
                    class="loading"
                >
                    Loading k6 reports...
                </td>

            </tr>

        `;


        /*
         * Load index.json
         */
        const index =
            await loadReportIndex();


        console.log(
            "k6 report index:",
            index
        );


        /*
         * Validate index
         */
        if (
            !index.reports ||
            !Array.isArray(index.reports)
        ) {

            throw new Error(
                "reports/index.json does not contain a valid reports array."
            );

        }


        if (
            index.reports.length === 0
        ) {

            runsEl.innerHTML = `

                <tr>

                    <td
                        colspan="11"
                        class="empty"
                    >
                        No reports published yet.
                    </td>

                </tr>

            `;

            statusEl.textContent =
                "No reports available";

            return;
        }


        /*
         * Load all reports
         */
        const reports = [];


        for (
            const filename
            of index.reports
        ) {

            try {

                console.log(
                    `Loading report: ${filename}`
                );


                const report =
                    await loadReport(filename);


                reports.push({

                    filename,

                    report

                });


            } catch (error) {

                console.error(
                    `Unable to load ${filename}`,
                    error
                );

            }

        }


        /*
         * Check whether any reports loaded
         */
        if (
            reports.length === 0
        ) {

            throw new Error(
                "Reports were found in index.json, but none of the report files could be loaded."
            );

        }


        /*
         * Sort reports
         *
         * Timestamped reports first.
         * Newest timestamp first.
         */
        reports.sort(
            (a, b) => {

                const dateA =
                    getReportDate(
                        a.filename
                    );

                const dateB =
                    getReportDate(
                        b.filename
                    );


                if (
                    dateA === "Unknown"
                ) {
                    return 1;
                }


                if (
                    dateB === "Unknown"
                ) {
                    return -1;
                }


                return dateB.localeCompare(
                    dateA
                );

            }
        );


        /*
         * Display report count
         */
        runCount.textContent =
            `${reports.length} report${
                reports.length === 1
                    ? ""
                    : "s"
            }`;


        document.getElementById(
            "statTotal"
        ).textContent =
            reports.length;


        /*
         * Render table
         */
        runsEl.innerHTML =
            reports
                .map(
                    item =>
                        renderRun(
                            item.filename,
                            item.report
                        )
                )
                .join("");


        /*
         * Latest report
         */
        const latest =
            reports[0];


        const latestMetrics =
            extractMetrics(
                latest.report
            );


        /*
         * Latest date
         */
        document.getElementById(
            "statDate"
        ).textContent =
            getReportDate(
                latest.filename
            );


        /*
         * Latest P95
         */
        document.getElementById(
            "statP95"
        ).textContent =
            formatMilliseconds(
                latestMetrics.p95
            );


        /*
         * Latest error rate
         */
        const latestErrorRate =
            latestMetrics.failureRate * 100;


        document.getElementById(
            "statErr"
        ).textContent =
            formatPercentage(
                latestErrorRate
            );


        /*
         * Latest status
         */
        const latestStatus =
            getStatus(
                latestErrorRate
            );


        const statusElement =
            document.getElementById(
                "statStatus"
            );


        statusElement.textContent =
            STATUS_LABEL[
                latestStatus
            ];


        statusElement.className =
            `value ${latestStatus}`;


        /*
         * Status message
         */
        statusEl.textContent =
            `Successfully loaded ${reports.length} report${
                reports.length === 1
                    ? ""
                    : "s"
            }.`;
        

        console.log(
            "k6 dashboard loaded successfully."
        );

    } catch (error) {

        console.error(
            "Dashboard error:",
            error
        );


        showError(
            error.message
        );

    }

}


/*
 * Start dashboard
 */
document.addEventListener(
    "DOMContentLoaded",
    init
);