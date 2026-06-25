/**
 * GOOGLE APPS SCRIPT - SISTEMA DE BACKUP INDIVIDUAL PARA CADA USUÁRIO (PERFIL)
 * 
 * Este script deve ser publicado como uma "Implantação de App Web" no Google Apps Script.
 * Ele cria automaticamente uma pasta principal no Google Drive chamada "Fale Comigo - Backups"
 * e, dentro dela, uma subpasta para cada perfil/usuário com um arquivo JSON único contendo
 * as figuras daquele usuário.
 * 
 * Configuração no Apps Script:
 * 1. Acesse https://script.google.com/
 * 2. Crie um novo projeto e cole este código.
 * 3. Clique em "Implantar" (Deploy) > "Nova implantação" (New deployment).
 * 4. Tipo: "App da Web" (Web App).
 * 5. Executar como: "Eu" (Seu e-mail do Google).
 * 6. Quem tem acesso: "Qualquer pessoa" (Anyone) - Necessário para que o App envie os dados sem login do Google.
 * 7. Copie a URL do App Web gerada e cole nas configurações do aplicativo.
 */

// Nome da pasta principal no Google Drive
var MAIN_FOLDER_NAME = "Fale Comigo - Backups";
var BACKUP_FILE_NAME = "backup.json";

// URL do Webhook do Discord para notificações (insira sua URL aqui)
var DISCORD_WEBHOOK_URL = "https://discordapp.com/api/webhooks/1519354513163550801/tmk8MVBor8L7rgLh4Chx_i8BbxBrwoLH2iB1gl74edNlw0_6ivczS79FwLBm_wkxzPYs";

/**
 * Função para enviar notificações para o Discord via Webhook
 */
function sendDiscordNotification(payload) {
  if (!DISCORD_WEBHOOK_URL) return;
  try {
    var options = {
      "method": "post",
      "contentType": "application/json",
      "payload": JSON.stringify(payload),
      "muteHttpExceptions": true
    };
    UrlFetchApp.fetch(DISCORD_WEBHOOK_URL, options);
  } catch (error) {
    console.error("Erro ao enviar notificação para o Discord: " + error.toString());
  }
}


/**
 * Função para processar requisições GET (Sincronização / download do backup do usuário)
 */
function doGet(e) {
  var action = e.parameter.action;
  var callback = e.parameter.callback; // Suporte a JSONP
  
  if (action === "validateCoupon") {
    var code = (e.parameter.code || "").trim().toUpperCase();
    var response = validateCouponInSheet(code);
    var jsonResponse = JSON.stringify(response);
    if (callback) {
      return ContentService.createTextOutput(callback + "(" + jsonResponse + ")")
        .setMimeType(ContentService.MimeType.JAVASCRIPT);
    } else {
      return ContentService.createTextOutput(jsonResponse)
        .setMimeType(ContentService.MimeType.JSON);
    }
  }
  
  if (action === "listProfiles") {
    var profilesList = [];
    try {
      var mainFolder = getOrCreateFolder(DriveApp.getRootFolder(), MAIN_FOLDER_NAME);
      var folders = mainFolder.getFolders();
      while (folders.hasNext()) {
        var folder = folders.next();
        var pName = folder.getName();
        var lastUpdated = null;
        var fileSize = null;
        
        var files = folder.getFilesByName(BACKUP_FILE_NAME);
        if (files.hasNext()) {
          var file = files.next();
          lastUpdated = file.getLastUpdated().toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" });
          fileSize = file.getSize();
        }
        
        profilesList.push({
          name: pName,
          lastUpdated: lastUpdated,
          size: fileSize
        });
      }
    } catch (error) {
      console.error("Erro ao listar perfis: " + error.toString());
    }
    
    var jsonResponse = JSON.stringify(profilesList);
    if (callback) {
      return ContentService.createTextOutput(callback + "(" + jsonResponse + ")")
        .setMimeType(ContentService.MimeType.JAVASCRIPT);
    } else {
      return ContentService.createTextOutput(jsonResponse)
        .setMimeType(ContentService.MimeType.JSON);
    }
  }

  var profile = e.parameter.profile || "Padrao";
  var cardsData = [];
  
  try {
    var mainFolder = getOrCreateFolder(DriveApp.getRootFolder(), MAIN_FOLDER_NAME);
    var profileFolder = getOrCreateFolder(mainFolder, profile);
    
    // Procura pelo arquivo de backup na pasta do usuário
    var files = profileFolder.getFilesByName(BACKUP_FILE_NAME);
    if (files.hasNext()) {
      var file = files.next();
      var content = file.getAs("text/plain").getDataAsString();
      cardsData = JSON.parse(content);
    }
  } catch (error) {
    console.error("Erro ao ler backup do perfil " + profile + ": " + error.toString());
  }
  
  var jsonResponse = JSON.stringify(cardsData);
  
  // Se for uma requisição JSONP (para evitar bloqueios CORS de arquivo local)
  if (callback) {
    var resultStr = callback + "(" + jsonResponse + ")";
    return ContentService.createTextOutput(resultStr)
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  } else {
    return ContentService.createTextOutput(jsonResponse)
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Função para processar requisições POST (Envio de backup / registro de acesso)
 */
function doPost(e) {
  var postContent = e.postData.contents;
  
  try {
    var data = JSON.parse(postContent);
    var profile = e.parameter.profile || (data && data.profile) || "Padrao";
    
    // Verifica se é uma chamada de registro de acesso
    if (data && data.action === "recordAccess") {
      logAccess(profile, data.accesses);
      return ContentService.createTextOutput(JSON.stringify({ status: "success", message: "Acesso registrado" }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    // Verifica se é uma chamada de envio de feedback
    if (data && data.action === "submitFeedback") {
      saveFeedback(data.name, data.message);
      return ContentService.createTextOutput(JSON.stringify({ status: "success", message: "Feedback recebido" }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    // Caso contrário, trata-se de um upload de figuras (backup)
    if (Array.isArray(data)) {
      var mainFolder = getOrCreateFolder(DriveApp.getRootFolder(), MAIN_FOLDER_NAME);
      var profileFolder = getOrCreateFolder(mainFolder, profile);
      
      // Procura se o arquivo de backup já existe para atualizar, ou cria um novo
      var files = profileFolder.getFilesByName(BACKUP_FILE_NAME);
      var backupFile;
      if (files.hasNext()) {
        backupFile = files.next();
        backupFile.setContent(JSON.stringify(data, null, 2));
      } else {
        backupFile = profileFolder.createFile(BACKUP_FILE_NAME, JSON.stringify(data, null, 2), "application/json");
      }
      
      return ContentService.createTextOutput(JSON.stringify({ 
        status: "success", 
        message: "Backup salvo com sucesso na pasta do usuário " + profile 
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    throw new Error("Formato de dados de backup inválido.");
    
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ 
      status: "error", 
      message: error.toString() 
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Função para salvar comentários/sugestões na pasta principal em um arquivo de texto único
 */
function saveFeedback(name, message) {
  try {
    var mainFolder = getOrCreateFolder(DriveApp.getRootFolder(), MAIN_FOLDER_NAME);
    var sheetName = "Sugestões e Comentários";
    var files = mainFolder.getFilesByName(sheetName);
    var spreadsheet;
    var sheet;
    
    if (files.hasNext()) {
      var file = files.next();
      spreadsheet = SpreadsheetApp.open(file);
      sheet = spreadsheet.getSheets()[0];
    } else {
      // Cria a planilha e move para a pasta principal do Fale Comigo
      spreadsheet = SpreadsheetApp.create(sheetName);
      var driveFile = DriveApp.getFileById(spreadsheet.getId());
      driveFile.moveTo(mainFolder);
      
      sheet = spreadsheet.getSheets()[0];
      // Adiciona cabeçalho na planilha
      sheet.appendRow(["Data e Hora", "Nome do Usuário", "Comentário / Ideia"]);
      sheet.getRange(1, 1, 1, 3).setFontWeight("bold").setBackground("#e2e8f0");
    }
    
    var timestamp = new Date().toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" });
    var author = name ? name.trim() : "Anônimo";
    
    // Adiciona o comentário como uma nova linha na planilha
    sheet.appendRow([timestamp, author, message]);

    // Envia notificação para o Discord
    sendDiscordNotification({
      "embeds": [{
        "title": "💬 Novo Feedback / Sugestão Recebida",
        "color": 3447003, // Azul bonito (Hex #3498db)
        "fields": [
          { "name": "👤 Usuário", "value": author, "inline": true },
          { "name": "📅 Data/Hora", "value": timestamp, "inline": true },
          { "name": "📝 Mensagem", "value": message }
        ],
        "footer": { "text": "Fale Comigo App • Notificações do Google Apps Script" }
      }]
    });
    
  } catch (error) {
    console.error("Erro ao salvar feedback na planilha: " + error.toString());
    throw error;
  }
}

/**
 * Função auxiliar para buscar ou criar uma pasta dentro de uma pasta pai
 */
function getOrCreateFolder(parentFolder, folderName) {
  var folders = parentFolder.getFoldersByName(folderName);
  if (folders.hasNext()) {
    return folders.next();
  } else {
    return parentFolder.createFolder(folderName);
  }
}

/**
 * Função opcional para registrar acessos em uma planilha ou arquivo de texto
 */
function logAccess(profile, accesses) {
  try {
    var mainFolder = getOrCreateFolder(DriveApp.getRootFolder(), MAIN_FOLDER_NAME);
    var profileFolder = getOrCreateFolder(mainFolder, profile);
    
    var logFileName = "acessos_log.txt";
    var logFiles = profileFolder.getFilesByName(logFileName);
    var logFile;
    
    var timestamp = new Date().toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" });
    var logLine = "[" + timestamp + "] Acessos acumulados: " + accesses + "\n";
    
    if (logFiles.hasNext()) {
      logFile = logFiles.next();
      var currentContent = logFile.getAs("text/plain").getDataAsString();
      logFile.setContent(currentContent + logLine);
    } else {
      profileFolder.createFile(logFileName, logLine, "text/plain");
    }

    // Envia notificação para o Discord
    sendDiscordNotification({
      "embeds": [{
        "title": "👤 Registro de Acesso",
        "color": 1752220, // Esmeralda (Hex #1abc9c)
        "fields": [
          { "name": "👤 Perfil", "value": profile, "inline": true },
          { "name": "📈 Total de Acessos", "value": String(accesses), "inline": true },
          { "name": "📅 Data/Hora", "value": timestamp, "inline": true }
        ],
        "footer": { "text": "Fale Comigo App • Notificações do Google Apps Script" }
      }]
    });
  } catch (e) {
    console.error("Erro ao gravar log de acesso: " + e.toString());
  }
}

/**
 * Função para validar o cupom na planilha "Sugestões e Comentários", aba "Cupons"
 */
function validateCouponInSheet(code) {
  if (!code) return { status: "invalid", message: "Código em branco" };
  try {
    var mainFolder = getOrCreateFolder(DriveApp.getRootFolder(), MAIN_FOLDER_NAME);
    var sheetName = "Sugestões e Comentários";
    var files = mainFolder.getFilesByName(sheetName);
    var spreadsheet;
    
    if (files.hasNext()) {
      spreadsheet = SpreadsheetApp.open(files.next());
    } else {
      spreadsheet = SpreadsheetApp.create(sheetName);
      var driveFile = DriveApp.getFileById(spreadsheet.getId());
      driveFile.moveTo(mainFolder);
      var defaultSheet = spreadsheet.getSheets()[0];
      defaultSheet.appendRow(["Data e Hora", "Nome do Usuário", "Comentário / Ideia"]);
      defaultSheet.getRange(1, 1, 1, 3).setFontWeight("bold").setBackground("#e2e8f0");
    }
    
    // Obtém ou cria a aba "Cupons"
    var couponSheet = spreadsheet.getSheetByName("Cupons");
    if (!couponSheet) {
      couponSheet = spreadsheet.insertSheet("Cupons");
      couponSheet.appendRow(["Cupom", "Ativo", "Limite de Acessos", "Total Acessos"]);
      couponSheet.getRange(1, 1, 1, 4).setFontWeight("bold").setBackground("#e2e8f0");
      // Insere cupom padrão ativo
      couponSheet.appendRow(["VIP99", "SIM", "", "0"]);
    }
    
    var data = couponSheet.getDataRange().getValues();
    for (var i = 1; i < data.length; i++) {
      var sheetCode = String(data[i][0]).trim().toUpperCase();
      if (sheetCode === code) {
        var active = String(data[i][1]).trim().toUpperCase();
        if (active !== "SIM") {
          return { status: "inactive", message: "Cupom inativo" };
        }
        var limitStr = String(data[i][2]).trim();
        var totalAcessos = parseInt(data[i][3]) || 0;
        if (limitStr !== "") {
          var limit = parseInt(limitStr) || 0;
          if (totalAcessos >= limit) {
            return { status: "exhausted", message: "Limite de uso esgotado" };
          }
        }
        
        // Incrementa o contador de acessos
        couponSheet.getRange(i + 1, 4).setValue(totalAcessos + 1);
        
        // Envia notificação ao Discord
        sendDiscordNotification({
          "embeds": [{
            "title": "🌟 Cupom Premium Ativado!",
            "color": 15844367, // Dourado (Hex #f1c40f)
            "fields": [
              { "name": "🔑 Cupom", "value": code, "inline": true },
              { "name": "📈 Acessos Totais", "value": String(totalAcessos + 1), "inline": true }
            ],
            "footer": { "text": "Fale Comigo App • Validador de Cupons" }
          }]
        });
        
        return { status: "success", premium: true };
      }
    }
    
    return { status: "not_found", message: "Cupom inválido" };
  } catch (error) {
    console.error("Erro ao validar cupom: " + error.toString());
    return { status: "error", message: "Erro no servidor: " + error.toString() };
  }
}
