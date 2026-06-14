export function buildPremiumImprovementPrompt({ scan, reference, knowledge }) {
  const findings = scan.topFiles.map((file) => {
    return {
      path: file.path,
      score: file.score,
      findings: file.findings.map((finding) => ({
        id: finding.id,
        severity: finding.severity,
        count: finding.count,
        recommendation: finding.recommendation,
        examples: finding.examples
      }))
    };
  });

  const techniques = knowledge.techniques.map((technique) => `${technique.name}: ${technique.target}`);

  return `
Eres un agente senior de arquitectura de experiencias premium. Tu tarea es mejorar el proyecto de forma concreta, revisable y segura.

OBJETIVO
Mejorar considerablemente la arquitectura visual, funcional y logica de la pagina/app/HTML detectada en este repositorio, usando patrones modernos sin romper comportamiento existente.

REFERENCIA PRINCIPAL
Nombre: ${reference.name}
URL: ${reference.url}
Patrones: ${reference.patterns.join(", ")}
Principios visuales: ${reference.visualPrinciples.join("; ")}
Tokens orientativos: ${JSON.stringify(reference.tokens)}

TECNICAS DISPONIBLES
${techniques.map((line) => `- ${line}`).join("\n")}

HALLAZGOS DEL SCANNER
${JSON.stringify(findings, null, 2)}

REGLAS DE IMPLEMENTACION
1. No copies marcas, textos, recursos ni layouts exactos de las referencias. Extrae principios transferibles.
2. Preserva funcionalidad y contratos existentes. No borres rutas, handlers, exports publicos ni estados que ya se usen.
3. Prioriza cambios con alto impacto y bajo riesgo:
   - Layouts fluidos con clamp(), minmax(), auto-fit/auto-fill, fr y container queries cuando el stack lo soporte.
   - Tipografia fluida y jerarquia visual clara.
   - Micro-interacciones ligeras con transform/opacity, cubic-bezier tipo spring y prefers-reduced-motion.
   - Estados de loading, empty, error, success y focus visibles.
   - Capas visuales con tokens de z-index y overlays previsibles.
4. No agregues Three.js, WebGL, Framer Motion o GSAP si el proyecto no los usa y el beneficio no justifica la dependencia. Si agregas una dependencia, explica por que y verifica build.
5. No uses animaciones pesadas en listas grandes ni durante scroll. Usa GPU-friendly transforms y lazy loading.
6. Si el proyecto tiene tests, lints o build scripts, ejecutalos. Si hay UI, intenta una verificacion visual o deja instrucciones exactas.
7. Crea cambios pequenos y cohesionados. Si el alcance es grande, abre PR con la primera mejora de mayor valor y deja backlog en la descripcion.
8. Nunca hardcodees secretos ni tokens.

ENTREGABLE
Implementa los cambios en una rama/PR si el runtime lo permite. En el resumen final incluye:
- Que problemas reales detectaste.
- Que mejoraste y por que mejora la experiencia.
- Riesgos o limites.
- Comandos de verificacion ejecutados.
`.trim();
}

export function buildDryRunSummary({ scan, reference }) {
  const top = scan.topFiles.slice(0, 8).map((file) => {
    const labels = file.findings.map((finding) => `${finding.id}(${finding.count})`).join(", ");
    return `- ${file.path}: score ${file.score} -> ${labels}`;
  });

  return `
Premium Experience Agent dry-run

Target: ${scan.target}
Scanned files: ${scan.scannedFiles}
Files with findings: ${scan.filesWithFindings}
Total findings: ${scan.totalFindings}
Suggested reference: ${reference.name}

Top opportunities:
${top.length > 0 ? top.join("\n") : "- No premium architecture issues found by the local scanner."}
`.trim();
}
