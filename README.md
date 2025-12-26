# bot.js

D'accord ! Pour ajouter une grille à votre plot et donner un bloc à placer pour le tester, nous allons modifier le modèle de votre plot pour y inclure des éléments visuels représentant la grille.

### 1. Ajouter une Grille dans le Plot

Pour créer une grille, nous allons ajouter des parties à votre modèle de plot qui seront disposées dans un format de grille. Voici comment procéder :

#### Script pour Ajouter une Grille dans le Plot

Voici un script que vous pouvez utiliser pour créer une grille à l'intérieur de chaque plot lorsque le script démarre. Nous allons créer un script dans `ServerScriptService` qui génère la grille pour chaque plot.

#### `AddGridToPlots.lua`

```lua
local Workspace = game:GetService("Workspace")

local function CreateGrid(plot)
    local gridSize = 4 -- Taille de chaque case de la grille
    local gridCount = 10 -- Nombre de cases sur chaque côté de la grille
    local gridFolder = Instance.new("Model") -- Créer un modèle pour la grille
    gridFolder.Name = "Grid"

    for i = 0, gridCount - 1 do
        for j = 0, gridCount - 1 do
            local gridPart = Instance.new("Part") -- Créer une nouvelle partie pour la grille
            gridPart.Size = Vector3.new(gridSize, 0.1, gridSize)
            gridPart.Position = plot.PrimaryPart.Position + Vector3.new(i * gridSize, 0, j * gridSize) -- Calculer la position
            gridPart.Anchored = true
            gridPart.Transparency = 0.5 -- Rendre la grille semi-transparente
            gridPart.Color = Color3.fromRGB(0, 255, 0) -- Couleur verte pour la grille
            gridPart.Parent = gridFolder -- Ajouter la partie à la grille

            -- Ajouter une autre pièce pour un aspect visuel si souhaité
            local linePart = Instance.new("Part")
            linePart.Size = Vector3.new(gridSize, 0.05, 0.1) -- Une autre taille pour simuler une ligne
            linePart.Position = gridPart.Position + Vector3.new(gridSize * 0.5, 0.1, 0) -- Positionner pour former une ligne
            linePart.Anchored = true
            linePart.Color = Color3.new(1, 0, 0) -- Couleur rouge pour la ligne
            linePart.Parent = gridFolder -- Ajouter la ligne à la grille
        end
    end

    gridFolder.Parent = plot -- Ajouter la grille au plot
end

local function SetupGrids()
    local plotsFolder = Workspace:FindFirstChild("Plots")
    if plotsFolder then
        for _, plot in ipairs(plotsFolder:GetChildren()) do
            if plot:IsA("Model") and plot.PrimaryPart then
                CreateGrid(plot) -- Créer la grille pour chaque plot
            end
        end
    else
        warn("Le dossier 'Plots' n'a pas été trouvé dans le workspace.")
    end
end

-- Appeler la fonction SetupGrids pour créer des grilles au démarrage
SetupGrids()
```

### 2. Instructions pour le Script

1. **Placement :** Ajoutez le script ci-dessus dans `ServerScriptService` et nommez-le `AddGridToPlots.lua`.

2. **Tester :**
   - Lancez votre jeu dans Roblox Studio.
   - Vérifiez ensuite chaque plot pour voir s'il a une grille ajoutée. 

### 3. Bloc à Placer pour Tester

Pour ajouter un bloc spécifique à placer, vous pouvez créer un `Part` simple dans votre modèle de plot ou à côté de celui-ci. Par exemple, vous pouvez créer un `Part` avec les propriétés suivantes :

- **Taille :** `(2, 1, 2)` (ou toute autre taille que vous préférez)
- **Couleur :** Par exemple, `Color3.fromRGB(255, 0, 0)` pour un bloc rouge.
- **Position :** Déplacez-le légèrement au-dessus de la grille pour qu'il soit bien visible.

Voici un exemple simple pour ajouter un bloc :

```lua
local block = Instance.new("Part")
block.Size = Vector3.new(2, 1, 2)
block.Position = plot.PrimaryPart.Position + Vector3.new(0, 5, 0) -- Placer au-dessus du plot
block.Anchored = true
block.Color = Color3.fromRGB(255, 0, 0) -- Couleur rouge
block.Parent = Workspace -- Ajouter à l'espace de travail
```

Ajoutez ce code dans le même script que `CreateGrid` ou dans un autre script pour le tester avec vos plots.

### Prochaines Étapes

- Ajoutez le script `AddGridToPlots.lua` et testez pour voir la grille.
- Ajoutez le bloc pour le visualiser et vérifier comment il s'intègre dans votre plot.

Si vous avez d'autres questions ou avez besoin de plus d'aide, n'hésitez pas à le faire savoir !
