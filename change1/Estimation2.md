# Estimation second round

## New development (release 1  -- march 22 to may 25)
| Measure| Value |
|---|---|
|effort E (report here effort in person hours, for all activities in the period, from your timesheet)  |302 person hours|
|size S (report here size in LOC of all code written, excluding test cases)  | 4257 |
|productivity P = S/E | 14 |
|defects before release D_before (number of defects found and fixed before may 25) | 11 |



## Corrective Maintenance (release 2 -- may 26 to june 8)

| Measure | Value|
|---|---|
| effort for non-quality ENQ (effort for all activities in release 2, or effort to fix defects found when running official acceptance tests) | 25 person hours|
| effort for non quality, relative = ENQ / E | 0,082 |
|defects after release D (number of defects found running official acceptance tests and  fixed in release 2) | 19 |
| defects before release vs defects after release = D/D_before | 0,57 |
|DD = defect density = D/S| 0,00446 |
|D_fix = average effort to fix a defect = ENQ / D | 1,31 |
|overall productivity OP = S/(E + ENQ)| 13 |

## Second estimation

Now it is possible to repeat the estimate using values from the past. We can also estimate (roughly) the number of defects and the effort to fix them.

|             | Estimate                        |             
| ----------- | ------------------------------- |  
| NC =  Estimated number of classes to be developed                 |              30           |             
|  A = Estimated average size per class, in LOC                     |              135            | 
| S_e = Estimated size of project, in LOC (= NC * A)                  |            4050              |
| E = Estimated effort, in person hours (here use overall productivity OP)  |        320                        |   
| C = Estimated cost, in euro (here use 1 person hour cost = 30 euro)      |     9600    | 
| D_e = Estimated number of defects = DD * S_e| 20 |
| Estimated effort for non quality = D_e * D_fix | 26,2 |
