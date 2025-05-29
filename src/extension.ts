import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {

	console.log('Congratulations, your extension "colorstore" is now active!');

	const disposable = vscode.commands.registerCommand('colorstore.helloWorld', () => {
		vscode.window.showInformationMessage('Hello nigga from colorstore!');
	});

	context.subscriptions.push(disposable);
}

export function deactivate() {}
