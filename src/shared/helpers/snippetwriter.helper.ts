import {Snippet, SnippetManager} from '../services';
import {Utilities} from './utilities';
import {ContextUtil, ContextType} from './contextutil';

export interface ICreateHtmlOptions {
    inlineJsAndCssIntoIframe: boolean
}

export class SnippetWriter {
    static createHtml(snippet: Snippet, options: ICreateHtmlOptions): string {
        var injectOfficeInitialize = snippet.containsOfficeJsReference && 
            !options.inlineJsAndCssIntoIframe /* don't need it when doing a run inside an iFrame */;

        var jsLibsToInclude = snippet.getJsLibaries()
            .filter(item => {
                var lowercase = item.toLowerCase();
                return !lowercase.endsWith("/office.js") && !lowercase.endsWith("/office.debug.js");
            });

        var js = snippet.getCompiledJs();
        
        var html = [
            '<!DOCTYPE html>',
            '<html>',
            '<head>',
            '    <meta charset="UTF-8" />',
            '    <meta http-equiv="X-UA-Compatible" content="IE=Edge" />',
            '    <title>Running snippet</title>'
        ];

        if (snippet.containsOfficeJsReference) {
            html.push(
                '',
                '    <!- Outside of the Office Add-in Playground (which references office.js differently) -->',
                '    <!- you would need to include the following script reference:                        -->',
                '    <!--<script src="//appsforoffice.microsoft.com/lib/1/hosted/office.js"></script>     -->',
                ''
            );
        }

        html.push(
            jsLibsToInclude.map(item => '    <script src="' + item + '"></script>').join("\n"),
            snippet.getCssStylesheets().map((item) => '    <link rel="stylesheet" href="' + item + '" />').join("\n")
        );

        if (options.inlineJsAndCssIntoIframe) {
            html.push("    <style>");
            
            if (Utilities.isNullOrWhitespace(snippet.html) && Utilities.isNullOrWhitespace(snippet.css)) {
                html.push(SnippetManager.getDefaultCss());
            } else {
                html.push(Utilities.indentAll(Utilities.stringOrEmpty(snippet.css).trim(), 2));
            }
            
            html.push("    </style>");

            var jsStringArray = ['"use strict";', ''];

            if (injectOfficeInitialize) {
                jsStringArray.push('Office.initialize = function (reason) {');
            }

            jsStringArray.push('$(document).ready(function () {');
            
            if (Utilities.isNullOrWhitespace(snippet.html)) {
                jsStringArray.push('$("#run").click(runSnippet);');
            } else {
                jsStringArray.push(js.trim());
            }

            jsStringArray.push('});');

            if (injectOfficeInitialize) {
                jsStringArray.push('};');
            }

            if (Utilities.isNullOrWhitespace(snippet.html)) {
                jsStringArray.push(
                    'function runSnippet() {',
                    js.trim(),
                    '}'
                );
            }

            if (snippet.script.indexOf('OfficeHelpers') >= 0) {
                jsStringArray.push('');
                ContextUtil.officeHelpersManualJs.split('\n').forEach((line) => jsStringArray.push(line));
            }

            var beautify = require('js-beautify').js_beautify;
            var jsString = Utilities.indentAll(
                Utilities.stripSpaces(beautify(jsStringArray.join("\n"))),
                2);

            html.push(
                "    <script>",
                jsString,
                "    </script>"
            );
        } else {
            html.push(
                "    <link type='text/css' rel='stylesheet' href='app.css' />",
                "    <script src='app.js'></script>"
            );
        }

        var htmlBody = Utilities.isNullOrWhitespace(snippet.html) ? 
            Utilities.stripSpaces(`
                <p class="ms-font-mPlus ms-fontWeight-semilight">
                    Your snippet contained only script code, with no user interface. We created a simple button to let you execute your code.
                </p>
                <button id="run" class="ms-Button">
                    <span class="ms-Button-label">Run code</span>
                </button>
            `) : snippet.html;

        html.push(
            '</head>',
            '<body>',
            Utilities.indentAll(htmlBody, 1),
            '</body>',
            '</html>'
        );

        return Utilities.stripSpaces(html.join('\n'));
    }
}