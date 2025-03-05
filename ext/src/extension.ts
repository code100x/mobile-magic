import { WebSocket } from 'ws';
import * as vscode from 'vscode';
import * as path from 'path';

type AdminMessage = {
	type: "command" | "update-file" | "prompt-start" | "prompt-end"
	content: string;
	path?: string;
};

async function ensureFileExists(filePath: string, content: string = '') {
	try {
	  const uri = vscode.Uri.file(filePath);
	  
	  // Check if the directory exists, create if not
	  const dirPath = path.dirname(filePath);
	  try {
		await vscode.workspace.fs.stat(vscode.Uri.file(dirPath));
	  } catch {
		// Directory doesn't exist, create it
		await vscode.workspace.fs.createDirectory(vscode.Uri.file(dirPath));
	  }
  
	  // Check if file exists
	  try {
		await vscode.workspace.fs.stat(uri);
	  } catch {
		// File doesn't exist, create it
		await vscode.workspace.fs.writeFile(uri, Buffer.from(content, 'utf8'));
	  }
  
	  return uri;
	} catch (error) {
	  vscode.window.showErrorMessage(`Error ensuring file exists: ${error}`);
	  throw error;
	}
  }
  

function initWs(context: vscode.ExtensionContext) {
	// change to something else
	const ws = new WebSocket(process.env.WS_RELAYER_URL || "ws://ws-relayer:9093");
	
	ws.onerror = (e: any) => {
		console.log("error", );
		console.log(e);
		console.log(JSON.stringify(e));
	}

	ws.onopen = () => {
		ws.send(JSON.stringify({
			event: "subscribe",
			data: null
		}));
	}

	ws.onmessage = async (e: any) => {
		const data: AdminMessage = JSON.parse(e.data);
		console.log(data);
		if (data.type === "command") {
			vscode.commands.executeCommand('extension.sendToAiTerminal', data.content);
		}

		if (data.type === "update-file") {
			const fileUri = await ensureFileExists(data.path!, data.content);

			const document = await vscode.workspace.openTextDocument(fileUri);
			await vscode.window.showTextDocument(document);

			const edit = new vscode.WorkspaceEdit();
			const range = new vscode.Range(
				new vscode.Position(0, 0),
				new vscode.Position(document.lineCount, 0)
			);

			edit.replace(document.uri, range, data.content);
			await vscode.workspace.applyEdit(edit);
		}

		if (data.type === "prompt-start") {
			const terminals = vscode.window.terminals;
			if (terminals.length > 0) {
				const activeTerminal = vscode.window.activeTerminal;
				activeTerminal?.sendText('\x03');
			}
		}

		if (data.type === "prompt-end") {
			vscode.commands.executeCommand('extension.sendToAiTerminal', "npm run web");
		}
	}

	return ws;

}

export function activate(context: vscode.ExtensionContext) {

	console.log('Congratulations, your extension "bolty-listener" is now active!');

	console.log("activate extension");
	let ws = initWs(context);
	ws.onerror = (e) => {
		initWs(context);	
	};
		
	const aiTerminal = vscode.window.createTerminal({
		name: "AI Terminal",
		hideFromUser: false
	});
	  
	  // Store the terminal for future reference
	  context.globalState.update('aiTerminalId', aiTerminal.processId);
	  
	  // Show the terminal
	  aiTerminal.show();
	  
	  // Pin the terminal (this requires the terminal tabs feature)
	  vscode.commands.executeCommand('workbench.action.terminal.focus');
	  vscode.commands.executeCommand('workbench.action.terminal.pin');
	  
	  // Register a command to send text to the AI terminal
	  let sendToAiTerminal = vscode.commands.registerCommand('extension.sendToAiTerminal', async (text) => {
		const terminalId = context.globalState.get('aiTerminalId');
		const terminals = vscode.window.terminals;
		const aiTerm = terminals.find(t => t.processId === terminalId);
		
		if (aiTerm) {
		  aiTerm.sendText(text);
		} else {
		  	vscode.window.showErrorMessage('AI Terminal not found. It may have been closed.');
	  
			const aiTerminal = vscode.window.createTerminal({
				name: "AI Terminal",
				hideFromUser: false
			});
			context.globalState.update('aiTerminalId', aiTerminal.processId);
			aiTerminal.show();
			aiTerminal.sendText(text);
		}
	  });
	  
	  context.subscriptions.push(sendToAiTerminal);

	const disposable = vscode.commands.registerCommand('bolty-listener.helloWorld', () => {
		vscode.window.showInformationMessage('Hello World from bolty-listener!');
		vscode.commands.executeCommand("workbench.action.terminal.new");
		vscode.commands.executeCommand("workbench.action.terminal.sendSequence", {text: "npm run build"});
		vscode.commands.executeCommand("workbench.action.terminal.sendSequence", {text: "\r"});
	});

	context.subscriptions.push(disposable);
}

export function deactivate() {}
