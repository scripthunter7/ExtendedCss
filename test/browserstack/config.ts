export const rawConfig = {
    test_framework: 'qunit',
    test_path: [
        'test/dist/browserstack.html',
    ],
    test_server_port: '9961',
    exit_with_fail: true,
    browsers: [
        {
            browser: 'Chrome',
            browser_version: '55',
            device: null,
            os: 'Windows',
            os_version: '10',
        },
        {
            browser: 'Firefox',
            browser_version: '52',
            device: null,
            os: 'Windows',
            os_version: '10',
        },
        {
            browser: 'Edge',
            browser_version: '80',
            device: null,
            os: 'Windows',
            os_version: '10',
        },
        {
            browser: 'Opera',
            browser_version: '80',
            device: null,
            os: 'Windows',
            os_version: '10',
        },
        {
            browser: 'Safari',
            browser_version: '11.1',
            device: null,
            os: 'OS X',
            os_version: 'High Sierra',
        },
    ],
};
