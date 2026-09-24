-- Diplôme, niveau et discipline d'une version d'étape, requête propre à l'université
-- Paris-Saclay.
--
-- La requête livrée par l'application joint apogee.extern_niveau_etape, table locale à
-- l'université de Bordeaux, absente du schéma de Paris-Saclay : elle échoue. Celle-ci renvoie
-- à la place les colonnes du calcul du niveau (CalculScolariteSaclay), avec les mêmes alias
-- que apogee_get_inscriptions.sql.
select dip.lib_dip,
       null             as niveau,
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
  and vet.cod_vrs_vet = :codVrsVet
-- une version d'étape peut relever de plusieurs diplômes ; OASIS retient la première ligne,
-- l'ordre la rend déterministe
order by dip.cod_dip, vdv.cod_sis_daa_min
