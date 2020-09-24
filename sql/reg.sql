drop table if exists vehicles, places;

create table places (
    id  serial not null primary key,
    name_of_place text not null,
    code text not null
   
);


create table vehicles (
    id  serial not null primary key,
    registration text not null,
    place_id int not null,
    foreign key (place_id) references places(id)
);



