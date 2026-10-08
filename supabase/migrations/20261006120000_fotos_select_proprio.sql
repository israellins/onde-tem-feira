-- =============================================================================
-- Corrige a exclusão de fotos do mural
--
-- O Storage só lista e apaga arquivos que o usuário consegue "ver" pela RLS de
-- storage.objects. Sem política de select, list() voltava vazio e remove() não
-- apagava nada: fotos ficavam para trás ao apagar um relato ou excluir a conta.
--
-- O bucket continua público para exibir as fotos pela URL; esta política só
-- permite ao usuário listar a própria pasta.
-- =============================================================================

create policy "Usuário lista as próprias fotos"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'post-photos'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );
