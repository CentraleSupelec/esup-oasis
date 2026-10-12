-- Diplôme, niveau et discipline d'une version d'étape, requête propre à l'université
-- Paris-Saclay.
--
-- La requête livrée par l'application joint apogee.extern_niveau_etape, table locale à
-- l'université de Bordeaux, absente du schéma de Paris-Saclay : elle échoue. Celle-ci calcule
-- le niveau par famille de diplôme, avec la même règle que apogee_get_inscriptions.sql : la
-- requête intérieure lit Apogée, la requête extérieure applique la règle.
select q.lib_dip,
       coalesce(
           case
               -- santé (PASS, LAS, études médicales) : pas de niveau L/M/D
               when q.tem_sante = 'O' then null
               -- BUT, DEUST, licence professionnelle (3 ans, 1 an), ingénieur : préfixe et année
               -- dans le diplôme, décalée de 2 pour l'ingénieur (étapes P3 à P5)
               when trim(q.cod_tpd_etb) in ('16', '13', '18', '85', '34') then
                   case when q.annee_diplome >= 1 then
                       decode(trim(q.cod_tpd_etb), '16', 'BUT', '13', 'DEUST', '34', 'ING', 'LP')
                           || to_char(trunc(q.annee_diplome) + decode(trim(q.cod_tpd_etb), '34', 2, 0))
                   end
               -- licence, double licence, master, master MEEF, CPES : entrée du cycle et année dans
               -- le diplôme ; tout autre type de diplôme (DU, échange entrant…) n'a pas de niveau
               when trim(q.cod_tpd_etb) in ('86', '93', '37', '39', '19') and q.annee_diplome >= 1 then
                   decode(decode(trim(q.cycle), '1', 0, '2', 3, '3', 5) + trunc(q.annee_diplome),
                          1, 'L1', 2, 'L2', 3, 'L3', 4, 'M1', 5, 'M2', 6, 'D1', 7, 'D2', 8, 'D3')
               end,
           -- à défaut, le niveau inscrit en tête du code étape (L1INFO, M2ARTS…)
           upper(regexp_substr(q.cod_etp, '^(L[1-3]|M[1-2]|D[1-3])', 1, 1, 'i'))
       ) as niveau,
       q.lib_dsi
from (select dip.lib_dip,
       dip.cod_dip,
       dsi.lib_dsi,
       vet.cod_etp,
       dip.cod_cyc      as cycle,
       dip.cod_tpd_etb,
       typ.tem_sante,
       vdv.cod_sis_daa_min as annee_diplome
from version_etape vet
         join vdi_fractionner_vet vdv on vet.COD_ETP = vdv.COD_ETP and vet.COD_VRS_VET = vdv.COD_VRS_VET
         join version_diplome vdi on vdv.COD_DIP = vdi.COD_DIP and vdv.COD_VRS_VDI = vdi.COD_VRS_VDI
         join diplome dip on dip.cod_dip = vdi.cod_dip
         left outer join typ_diplome typ on typ.cod_tpd_etb = dip.cod_tpd_etb
         left outer join sec_dis_sis sds on sds.cod_sds = dip.cod_sds
         left outer join discipline_sis dsi on dsi.cod_dsi = sds.cod_dsi
where vet.cod_etp = :codEtp
  and vet.cod_vrs_vet = :codVrsVet) q
-- une version d'étape peut relever de plusieurs diplômes ; OASIS retient la première ligne,
-- l'ordre la rend déterministe
order by q.cod_dip, q.annee_diplome
