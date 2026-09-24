-- Inscriptions d'un étudiant, requête propre à l'université Paris-Saclay.
--
-- Le niveau d'études et le redoublement ne sont pas calculés ici : la requête renvoie les
-- colonnes dont a besoin le calcul de l'établissement (CalculScolariteSaclay, sélectionné
-- par SI_SCOL_CALCUL=apogee_saclay), qui les lit dans les données transmises par OASIS.
-- Les alias cycle, annee_diplome, cod_tpd_etb, tem_sante, cod_etp, nbr_ins_etp et
-- cod_sis_cur_amg doivent donc être conservés tels quels.
select iae.cod_anu,
       vet.cod_etp,
       vet.cod_vrs_vet,
       vet.lib_web_vet,
       cmp.cod_cmp,
       cmp.lib_cmp,
       to_char(i.date_nai_ind, 'YYYY-MM-DD') as date_nai_ind,
       i.cod_sex_etu,
       case
           when annuelle.num_tel_port is not null then trim(annuelle.num_tel_port)
           when fixe.num_tel_port is not null then trim(fixe.num_tel_port)
           when annuelle.num_tel is not null then trim(annuelle.num_tel)
           else trim(fixe.num_tel)
           end                               as num_tel,
       iaa.tem_brs_iaa,
       -- situation sociale : le code NO signifie « non renseigné » dans le paramétrage de
       -- Paris-Saclay, on le neutralise ici plutôt que côté OASIS, qui affiche tout code présent.
       case when iaa.cod_soc = 'NO' then null else iaa.cod_soc end as cod_soc,
       case when iaa.cod_soc = 'NO' then null else soc.lib_soc end as lib_soc,
       rgi.lib_rgi,
       dip.lib_dip,
       -- pas de table de niveaux d'étape chez Paris-Saclay : le niveau est calculé par
       -- CalculScolariteSaclay à partir des colonnes ci-dessous
       null as niveau,
       dsi.lib_dsi,
       -- adresse : adresse annuelle seule (l'adresse fixe ne sert qu'au téléphone). Ville
       -- via la commune (lib_ade en repli pour l'acheminement à l'étranger), pays en libellé.
       annuelle.lib_ad1 as adr_lib_ad1,
       annuelle.lib_ad2 as adr_lib_ad2,
       annuelle.lib_ad3 as adr_lib_ad3,
       annuelle.cod_bdi as adr_cod_bdi,
       nvl(com.lib_com, annuelle.lib_ade) as adr_lib_vil,
       pay.lib_pay as adr_cod_pay,
       -- colonnes du calcul du redoublement
       iae.nbr_ins_etp,
       amg.cod_sis_cur_amg,
       amg.lib_cur_amg,
       -- colonnes du calcul du niveau (mêmes alias dans apogee_get_formation.sql)
       dip.cod_cyc as cycle,       -- cycle du diplôme (1 = Licence, 2 = Master, 3 = Doctorat)
       dip.cod_tpd_etb,            -- type de diplôme (code propre à l'établissement)
       typ.tem_sante,              -- indicateur santé (O/N) porté par le type de diplôme
       (select min(fra.cod_sis_daa_min)
        from vdi_fractionner_vet fra
        where fra.cod_etp = iae.cod_etp
          and fra.cod_vrs_vet = iae.cod_vrs_vet
          and fra.cod_dip = iae.cod_dip) as annee_diplome -- année dans le diplôme (SISE)
from ins_adm_etp iae
         join diplome dip on dip.cod_dip = iae.cod_dip
         left outer join typ_diplome typ on typ.cod_tpd_etb = dip.cod_tpd_etb
         left outer join sec_dis_sis sds on sds.cod_sds = dip.cod_sds
         left outer join discipline_sis dsi on dsi.cod_dsi = sds.cod_dsi
         join individu i on i.cod_ind = iae.cod_ind
         join ins_adm_anu iaa on iaa.cod_ind = i.cod_ind and iaa.cod_anu = iae.cod_anu and iaa.eta_iaa = 'E'
         join regime_ins rgi on rgi.cod_rgi = iaa.cod_rgi
         left outer join sit_sociale soc ON (soc.cod_soc = iaa.cod_soc)
         join composante cmp on cmp.cod_cmp = iae.cod_cmp
         join version_etape vet on vet.cod_etp = iae.cod_etp and vet.cod_vrs_vet = iae.cod_vrs_vet
         left outer join cursus_amg amg on (amg.cod_cur_amg = iae.cod_cur_amg)
         left outer join adresse fixe on fixe.cod_ind = i.cod_ind
         left outer join adresse annuelle on annuelle.cod_ind_ina = i.cod_ind and annuelle.cod_anu_ina = iae.cod_anu
         left outer join commune com on (com.cod_com = annuelle.cod_com)
         left outer join pays pay on (pay.cod_pay = annuelle.cod_pay)
where i.cod_etu = :codEtu
  and iae.cod_anu between :debut and :fin
  and iae.tem_iae_prm = 'O'
  and iae.eta_iae = 'E'
order by iae.cod_anu
