# bot.js


Merci pour la clarification concernant le système de plots. Je vais vous aider à faire fonctionner correctement l'attribution des plots, que vous utilisiez des `Part` ou des `Model`. Voici les ajustements nécessaires :

### 1. Configuration des Plots

Pour que le système reconnaisse les plots, vous devez utiliser un modèle pour chaque plot, ou simplement utiliser un `Part` pour chaque plot. Pour faciliter la gestion :

- Créez un dossier `Plots` dans `workspace`.
- À l'intérieur de ce dossier, ajoutez un modèle pour chaque plot. Chaque modèle peut contenir plusieurs parties (par exemple, pour créer des décorations ou des structures plus complexes).

### 2. Modification du Script `PlotManager.lua`

Voici une version améliorée du script qui est sensible à l'utilisation de modèles. Assurez-vous que le modèle est ancré afin que sa position soit stable à l'utilisation. 

#### `PlotManager.lua`

```lua
local Players = game:GetService("Players")
local Plots = {}
local AssignedPlots = {}

-- Fonction pour initialiser les plots
local function SetupPlots()
    local plotsFolder = workspace:FindFirstChild("Plots")
    if plotsFolder then
        for _, plot in ipairs(plotsFolder:GetChildren()) do
            if plot:IsA("Model") and plot.PrimaryPart then -- Vérifiez si c'est un modèle et a une partie principale
                table.insert(Plots, plot) -- Ajouter le plot
                table.insert(AssignedPlots, false) -- Indiquer que le plot n'est pas encore attribué
            end
        end
    else
        warn("Le dossier 'Plots' n'a pas été trouvé dans le workspace.")
    end
end

-- Fonction pour attribuer un plot à un joueur
local function AssignPlot(player)
    local plotAssigned = false
    for i, plot in ipairs(Plots) do
        if not AssignedPlots[i] then
            AssignedPlots[i] = true -- Marquer le plot comme attribué
            plotAssigned = true
            
            -- S'assurer que le personnage est complètement chargé avant de téléporter le joueur
            player.CharacterAdded:Wait() -- Attendre que le personnage soit ajouté
            local character = player.Character or player.CharacterAdded:Wait() -- Récupérer le personnage
            character:SetPrimaryPartCFrame(plot.PrimaryPart.CFrame + Vector3.new(0, 5, 0)) -- Téléportation au plot
            player:SetAttribute("CurrentPlot", plot.Name) -- Stocker le nom du plot
            break
        end
    end

    if not plotAssigned then
        warn(player.Name .. " n'a pas pu se voir attribuer un plot.") -- Avertir si aucun plot n'est disponible
    end
end

-- Événement pour gérer l'arrivée d'un joueur
Players.PlayerAdded:Connect(function(player)
    SetupPlots() -- Configuration des plots
    AssignPlot(player) -- Assigner un plot au joueur
end)

-- Appel de la fonction pour configurer les plots
SetupPlots()
```

### 3. Conseils Pratiques

- **Modèles et Parties Principales :** Assurez-vous que chacun de vos modèles de plot a une propriété `PrimaryPart`. Vous pouvez définir une partie comme `PrimaryPart` dans Roblox Studio :
  - Cliquez sur le modèle dans l'Explorer.
  - Dans les propriétés, trouvez la propriété `PrimaryPart` et sélectionnez la partie qui sera la référence pour la téléportation.
  
- **Ancrage :** Assurez-vous que les parties des modèles sont ancrées, afin qu'elles ne bougent pas lors de l'exécution du jeu.

### 4. Tester

1. **Créez des modèles de plots** dans le dossier `Plots` comme discuté.
2. **Implémentez et testez** le script ajusté `PlotManager.lua`.
3. **Vérifiez à nouveau la console** pour obtenir des avertissements en cas de problèmes ou vérifier si les plots sont bien attribués.

N'hésitez pas à poser d'autres questions ou à demander d'autres ajustements si besoin !
