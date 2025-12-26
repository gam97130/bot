# bot.js

Il semble que le système de téléportation des joueurs aux plots ne fonctionne pas comme prévu. Cela peut être dû à la manière dont les plots sont configurés ou à l'ordre d'exécution des scripts. 

Assurons-nous d'ajuster le `PlotManager.lua` pour garantir que les plots soient correctement reconnus et que les joueurs soient bien téléportés à leurs plots lorsqu'ils rejoignent le jeu. Voici quelques étapes et ajustements que vous pouvez essayer :

### 1. Vérifier la Configuration des Plots

Assurez-vous que vos objets plots sont correctement installés dans un dossier nommé `Plots` dans le **workspace**. Chaque plot devrait être un objet de type `Part`. Par exemple :

- **workspace**
  - **Plots** (dossier)
    - Plot1 (Part)
    - Plot2 (Part)
    - Plot3 (Part)

### 2. Modification du Script `PlotManager.lua`

Il est possible que le script ne soit pas exécuté après que le personnage du joueur ait été complètement chargé. Essayez cette version modifiée du script pour que la téléportation se fasse une fois que le Character est complètement chargé.

#### `PlotManager.lua`

```lua
local Players = game:GetService("Players")
local Plots = {}
local AssignedPlots = {}

-- Fonction pour initialiser les plots
local function SetupPlots()
    local plotsFolder = workspace:FindFirstChild("Plots")
    if plotsFolder then
        for i, plot in ipairs(plotsFolder:GetChildren()) do
            Plots[i] = plot
            AssignedPlots[i] = false -- Indique que le plot n'est pas encore attribué
        end
    end
end

-- Fonction pour attribuer un plot à un joueur
local function AssignPlot(player)
    local plotAssigned = false
    for i, plot in ipairs(Plots) do
        if not AssignedPlots[i] then
            AssignedPlots[i] = true -- Marquer le plot comme attribué
            plotAssigned = true

            -- Assurez-vous que le Character est complètement chargé avant de téléporter le joueur
            player.CharacterAdded:Wait() -- Attendre que le personnage soit ajouté
            local character = player.Character or player.CharacterAdded:Wait() -- Récupérer le personnage
            character:SetPrimaryPartCFrame(plot.Position + Vector3.new(0, 5, 0)) -- Téléportation au plot
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
    SetupPlots() -- Assurer que la configuration des plots se fasse à chaque fois qu'un joueur se connecte
    AssignPlot(player) -- Assigner un plot au joueur
end)

-- Appel de la fonction pour configurer les plots
SetupPlots()
```

### 3. Tester le Jeu

1. **Assurez-vous** que le dossier `Plots` contient bien des objets de type `Part`.
2. **Implémentez les modifications** dans le script `PlotManager.lua`.
3. **Lancez le jeu** dans Roblox Studio en mode Play pour voir si les joueurs sont maintenant correctement téléportés à leurs plots.

### 4. Déboguer

Si cela ne fonctionne toujours pas :

- **Ouvrez la console** dans Roblox Studio (View > Output) pour voir si des messages d'avertissement apparaissent.
- **Vérifiez si `AssignedPlots` est correctement rempli** lors de la création des joueurs en ajoutant quelques `print()` pour voir quels plots sont attribués.

N'hésitez pas à poser d'autres questions si cela ne résout pas le problème ou si vous avez besoin d'autres ajustements !
