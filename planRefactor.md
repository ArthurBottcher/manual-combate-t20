# Plano de Correcoes - Manual Combate T20
## FASE 1: Bugs Críticos
### 1. Validação de duplicidade em `addNewScenario` (`App.tsx:120-138`)
**Problema:** O cenário duplicado é criado e ativado antes da validação. O `return` posterior é inútil.
**Correção:** Mover a verificação `scenarios.some(...)` para ANTES de criar o novo cenário.
### 2. IDs baseados em `Date.now()` podem colidir (`App.tsx:60,125`)
**Problema:** `id: Date.now().toString()` pode gerar IDs idênticos em operações rápidas.
**Correção:** Usar `crypto.randomUUID()` (nativo do browser) para IDs únicos.
### 3. Crash silencioso em `handleDeleteSkill` (`App.tsx:102`)
**Problema:** `activeScenario` pode ser `undefined` (resultado de `Array.find()`), e acessar `.skills` vai crashar.
**Correção:** Adicionar guard `if (!activeScenario) return;` antes do acesso.
### 4. `useEffect` com dependência desnecessária (`SkillFormModal.tsx:19-31`)
**Problema:** `isOpen` nas dependências faz o efeito rodar desnecessariamente, podendo corromper o estado do formulário ao alternar entre add/edit.
**Correção:** Remover `isOpen` das dependências. Usar apenas `[skillToEdit]`.
---
## FASE 2: Melhorias de Qualidade
### 5. `JSON.parse` sem tratamento (`geminiService.ts:67,115`)
**Problema:** Se a API retornar resposta inesperada, `JSON.parse` lança e o erro real é mascarado.
**Correção:** Envolver `JSON.parse` em try/catch próprio com mensagem de erro clara.
### 6. Tipagem fraca nos catches (`AIAssistantModal.tsx:48`, `AIScenarioAssistantModal.tsx:48`)
**Problema:** `err: any` e acesso direto a `err.message` sem verificação.
**Correção:** Usar `err instanceof Error` antes de acessar `.message`.
### 7. Variável redundante no `vite.config.ts` (`vite.config.ts:10`)
**Problema:** `process.env.GEMINI_API_KEY` é definida com o mesmo valor que `API_KEY` mas nunca usada.
**Correção:** Remover a linha redundante.
### 8. Campos opcionais enviam string vazia (`SkillFormModal.tsx:40`)
**Problema:** `"manaCost": ""` e `"origin": ""` poluem o localStorage ao invés de omitir o campo.
**Correção:** Enviar `undefined` quando os campos estiverem vazios:
```ts
onSubmit({
  name,
  description,
  manaCost: manaCost || undefined,
  origin: origin || undefined,
});
9. Remoção por nome pode apagar duplicatas (AIAssistantModal.tsx:61)
Problema: Se dois skills sugeridos tiverem o mesmo nome, ambos são removidos ao clicar em um.
Correção: Usar índice ou referência ao objeto ao invés de comparar por nome.
10. asChild redundante no ConfirmationDialog (ConfirmationDialog.tsx:41-42)
Problema: AlertDialogAction e AlertDialogCancel já renderizam botões. asChild adiciona complexidade desnecessária.
Correção: Usar os componentes diretamente sem asChild.
11. Vírgula solta no genérico (useLocalStorage.ts:4)
Problema: <T,> tem vírgula desnecessária.
Correção: <T>.
---
FASE 3: Refatoração
12. Extrair SkillCard para arquivo próprio
Ação: Criar components/SkillCard.tsx com o componente atualmente inline no App.tsx.
13. Mover animações inline para index.css
Problema: Keyframes fade-in-scale e fade-in duplicadas em 3 componentes via <style> inline.
Ação: Adicionar como classes globais no index.css e remover os <style> inline.
14. Extrair hook useCharacterForm
Problema: AIAssistantModal e AIScenarioAssistantModal compartilham ~80% do código (formulário CharacterInfo, loading, reset).
Ação: Criar hooks/useCharacterForm.ts com a lógica compartilhada de estado e reset.