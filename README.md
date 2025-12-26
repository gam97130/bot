# bot.js

D'accord, créons un script simple qui va vous aider à tester la détection des plots et vous téléporter à l'un d'eux. Ce script sera conçu pour être utilisé dans `ServerScriptService`. Assurez-vous d'avoir le dossier `Plots` avec des modèles de plot correctement placés dans `workspace`.

### Script de Test pour Téléportation

Voici un exemple de script qui détecte les modèles dans le dossier `Plots` et vous téléporte à l'un d'eux :

#### `TeleportToPlot.lua`

```lua
local Players = game:GetService("Players")
local Workspace = game:GetService("Workspace")

-- Fonction pour téléporter un joueur à un plot
local function TeleportToPlot(player)
    -- Vérifiez le dossier "Plots" dans Workspace
    local plotsFolder = Workspace:FindFirstChild("Plots")
    if plotsFolder then
        -- Obtenir tous les plots
        local plots = plotsFolder:GetChildren()
        
        -- Vérifiez s'il y a des plots
        if #plots > 0 then
            -- Choisir un plot aléatoire
            local randomPlot = plots[math.random(1, #plots)]
            if randomPlot:IsA("Model") and randomPlot.PrimaryPart then
                -- Attendre que le personnage soit chargé
                player.CharacterAdded:Wait()
                local character = player.Character or player.CharacterAdded:Wait()
                -- Se téléporter à la position du plot
                character:SetPrimaryPartCFrame(randomPlot.PrimaryPart.CFrame + Vector3.new(0, 5, 0)) -- Élever légèrement au-dessus du plot
                print(player.Name .. " a été téléporté à " .. randomPlot.Name) -- Message de confirmation
            else
                warn("Le plot sélectionné n'est pas un modèle valide ou n'a pas de PrimaryPart.")
            end
        else
            warn("Aucun plot trouvé dans le dossier 'Plots'.")
        end
    else
        warn("Le dossier 'Plots' est introuvable dans le Workspace.")
    end
end

-- Événement pour tester la téléportation lorsqu'un joueur rejoint
Players.PlayerAdded:Connect(function(player)
    player.CharacterAdded:Wait() -- Attendre que le personnage soit chargé
    TeleportToPlot(player) -- Appel de la fonction pour téléporter le joueur
end)

```

### Instructions pour le Script

1. **Placement :** Placez le script ci-dessus dans `ServerScriptService` sous le nom `TeleportToPlot.lua`.

2. **Tester le Script :** 
   - Lancez votre jeu dans Roblox Studio en mode Play.
   - Lorsque vous rejoignez le jeu, le script va automatiquement vous téléporter à un des plots disponibles dans le dossier `Plots`.

3. **Console de Débogage :** 
   - Ouvrez la console (View > Output) pour voir des messages de confirmation ou d'avertissement.
   - Si un message indique que le plot est introuvable ou que la téléportation a échoué, vérifiez bien les noms et la structure de votre dossier `Plots`.

### Éléments à Vérifier
- Assurez-vous que les modèles de plots (comme `plot1`, `plot2`, etc.) ont une propriété **PrimaryPart** définie.
- Vérifiez que le dossier `Plots` est bien orthographié et placé directement dans l’espace de travail.

Si vous avez d'autres questions ou si certains problèmes persistent, n'hésitez pas à me le faire savoir pour plus d'assistance !
