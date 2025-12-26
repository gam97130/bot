# bot.js

Pour permettre à votre script de reconnaître le plot et pour s'assurer que les grilles s'affichent correctement, voici des instructions détaillées, y compris où placer chaque script, s'il s'agit d'un script local ou serveur, et comment afficher les grilles.

### 1. Structure des Fichiers et Scripts

#### Placement des Scripts

1. **`PlotManager.lua`**
   - **Placement :** `ServerScriptService`
   - **Type :** Script serveur

2. **`PlacementSystem.lua`**
   - **Placement :** `StarterPlayer -> StarterPlayerScripts`
   - **Type :** Script local

3. **Script pour afficher la grille**
   - **Placement :** `ServerScriptService`
   - **Type :** Script serveur (vous pourrez facilement le modifier pour l'affichage)

### 2. Affichage des Grilles

Pour afficher les grilles sur le terrain afin de vérifier leur fonctionnement, vous pouvez créer un script qui dessine des parties visibles de la grille dans le monde. Voici un exemple que vous pourriez utiliser :

**Script : `GridDisplay.lua`**

```lua
-- Placer ce script dans ServerScriptService
local gridSize = 4
local gridCount = 20 -- Nombre de cases visibles dans chaque direction

for i = 0, gridCount do
    for j = 0, gridCount do
        local gridPart = Instance.new("Part") -- Créer une nouvelle part
        gridPart.Size = Vector3.new(gridSize, 0.1, gridSize)
        gridPart.Position = Vector3.new(i * gridSize, 0.05, j * gridSize) -- Positionner selon la grille
        gridPart.Anchored = true
        gridPart.Transparency = 0.5 -- Rendre la grille semi-transparente
        gridPart.Color = Color3.fromRGB(255, 255, 0) -- Couleur jaune
        gridPart.Parent = workspace -- Ajouter à l'espace de travail
    end
end
```

### 3. Modifier le Script `PlotManager.lua`

Pour que le `PlotManager` reconnaisse et affiche les plots, vous devez également vous assurer que chacun de vos plots est bien défini dans le workspace comme suit:

- **Création des Plots :** Placez vos plots en tant que pièces (Parts) dans un dossier nommé `Plots` dans le workspace. Chaque plot devrait avoir un nom unique, par exemple `Plot1`, `Plot2`, etc.

### 4. Résumé des Scripts

#### `PlotManager.lua`

Voici le script complet pour `PlotManager.lua` avec des précisions sur la gestion des plots :

```lua
local Players = game:GetService("Players")
local Plots = {} -- Table pour stocker les plots
local AssignedPlots = {} -- Table pour suivre les plots attribués

-- Fonction pour initialiser les plots
local function SetupPlots()
    local plotsFolder = workspace:FindFirstChild("Plots")
    if plotsFolder then
        for i, plot in ipairs(plotsFolder:GetChildren()) do
            Plots[i] = plot
            AssignedPlots[i] = false -- False indique que le plot n'est pas encore attribué
        end
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
    player.CharacterAdded:Wait() -- Attendre que le personnage soit chargé pour éviter les erreurs
    AssignPlot(player) -- Assigner un plot au joueur
end)

-- Appel de la fonction pour configurer les plots
SetupPlots()
```

### Prochaines Étapes :

1. **Créez un dossier "Plots"** dans le workspace et ajoutez-y des objets Part. Nommez-les comme vous le souhaitez (ex: `Plot1`, `Plot2`, ...).
  
2. **Ajoutez le script `GridDisplay.lua`** dans `ServerScriptService` pour visualiser la grille.

3. **Testez le jeu dans Roblox Studio** en mode "Play" pour vérifier que les plots s'affichent correctement et que les joueurs sont téléportés à leur plot.

N'hésitez pas à demander si vous avez besoin d'autres précisions ou d'aide supplémentaire !
