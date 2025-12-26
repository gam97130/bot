# bot.js

D'accord, voici comment vous pouvez gérer le placement des plots de manière manuelle tout en attribuant automatiquement un plot à chaque joueur à leur arrivée. Je fournirai également un exemple de script pour gérer les plots et le système de grille.

### 1. Système de Plots

**Concept :**
- Les plots peuvent être pré-placés sur la carte par vous (le développeur) et chaque joueur se verra attribuer l'un de ces plots à son arrivée.
- Vous pouvez également créer un système qui permet aux joueurs de décorer leur plot une fois qu'ils y sont téléportés.

### 2. Exemple de script pour gérer les plots

Voici un exemple basique de script pour le système de plots dans `ServerScriptService`.

**Script : `PlotManager.lua`**

```lua
local Players = game:GetService("Players")
local Plots = {} -- Table pour stocker les plots
local AssignedPlots = {} -- Table pour suivre les plots attribués

-- Fonction pour initialiser les plots
local function SetupPlots()
    for i, plot in ipairs(workspace.Plots:GetChildren()) do
        Plots[i] = plot
        AssignedPlots[i] = false -- False indique que le plot n'est pas encore attribué
    end
end

-- Fonction pour attribuer un plot à un joueur
local function AssignPlot(player)
    for i, plot in ipairs(Plots) do
        if not AssignedPlots[i] then
            AssignedPlots[i] = true -- Marquer le plot comme attribué
            player.Character:SetPrimaryPartCFrame(plot.Position + Vector3.new(0, 5, 0)) -- Téléportation au plot
            player:SetAttribute("CurrentPlot", plot.Name) -- Stocke le nom du plot
            break
        end
    end
end

-- Événement pour gérer l'arrivée d'un joueur
Players.PlayerAdded:Connect(function(player)
    -- Attendre que le personnage soit chargé
    player.CharacterAdded:Wait()
    AssignPlot(player) -- Assigner un plot au joueur
end)

-- Appel de la fonction pour configurer les plots
SetupPlots()
```

### 3. Exemple de système de grille

**Script : `PlacementSystem.lua`**

Ce script gère le placement de machines sur la grille.

```lua
local Players = game:GetService("Players")
local UserInputService = game:GetService("UserInputService")
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local MachineModule = require(ReplicatedStorage.Modules.MachineModule) -- Module pour les machines

local gridSize = 4 -- Taille de chaque case de la grille
local isPlacing = false -- État du mode de placement

local function getGridPosition(mousePosition)
    local x = math.floor(mousePosition.X / gridSize) * gridSize
    local y = math.floor(mousePosition.Y / gridSize) * gridSize
    return Vector3.new(x, 0, y) -- Renvoie la position de la grille
end

UserInputService.InputBegan:Connect(function(input, isProcessed)
    if not isProcessed and input.UserInputType == Enum.UserInputType.MouseButton1 and isPlacing then
        local player = Players.LocalPlayer
        local mouse = player:GetMouse()
        
        local gridPosition = getGridPosition(mouse.Hit.Position) -- Calculer la position de la grille
        local machine = MachineModule.CreateMachine() -- Appeler une fonction pour créer une machine
        
        machine.Position = gridPosition -- Placer la machine sur la grille
        machine.Parent = workspace -- Ajouter la machine à l'espace de travail
    end
end)

-- Fonction pour commencer le mode de placement
function StartPlacement()
    isPlacing = true
end

-- Fonction pour arrêter le mode de placement
function StopPlacement()
    isPlacing = false
end
```

### Explication

- Le script `PlotManager.lua` établit un système où des plots sont préalablement définis dans le workspace. Lorsqu'un joueur se connecte, il est automatiquement attribué à un de ces plots, et il est téléporté à sa position.
  
- Le script `PlacementSystem.lua` permet aux joueurs de placer des machines sur une grille. Le `gridSize` définit la taille d'une case de la grille, et le script détermine la position de la machine sur la grille lors du clic de la souris.

### Prochaines étapes

Vous pouvez tester ces scripts dans Roblox Studio et apporter des ajustements en fonction des besoins spécifiques de votre jeu. Si vous avez des questions supplémentaires ou avez besoin d'aide avec d'autres fonctionnalités, n'hésitez pas à demander !
